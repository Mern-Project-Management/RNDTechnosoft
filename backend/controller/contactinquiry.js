const { default: axios } = require('axios');
const ContactInquiry = require('../model/contactinquiry');
const { sendThankYouEmail, sendMailWithFallback } = require('../utils/emailService');

exports.createInquiry = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    // Step 1: Save to database
    const newInquiry = new ContactInquiry(req.body);
    await newInquiry.save();
    console.log('✓ Inquiry saved to database successfully');

    // Send immediate response to client
    res.status(201).json({ 
      success: true, 
      message: 'Inquiry submitted successfully',
      data: {
        id: newInquiry._id,
        name: newInquiry.name,
        email: newInquiry.email
      }
    });

    // Process email and external API asynchronously
    processContactInquiryAsync(newInquiry);

  } catch (error) {
    console.error('✗ Main error in createInquiry:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Async function to handle email and external API calls
async function processContactInquiryAsync(inquiry) {
  // Process admin email, thank you email, and external API in parallel
  const emailPromise = sendContactEmail(inquiry);
  const thankYouPromise = sendThankYouEmail({
    to: inquiry.email,
    name: inquiry.name,
    subject: 'Thank You for Contacting RND Technosoft',
    formType: 'Contact Inquiry',
    inquiryDetails: {
      'Name': inquiry.name,
      'Email': inquiry.email,
      'Phone': inquiry.phone,
      'Subject': inquiry.subject,
      'Message': inquiry.message
    }
  });
  const externalApiPromise = sendContactToExternalAPI(inquiry);

  // Execute all operations in parallel
  const [emailResult, thankYouResult, apiResult] = await Promise.allSettled([emailPromise, thankYouPromise, externalApiPromise]);

  // Log results
  if (emailResult.status === 'fulfilled') {
    console.log('✓ Admin email processing completed');
  } else {
    console.error('✗ Admin email processing failed:', emailResult.reason);
  }

  if (thankYouResult.status === 'fulfilled') {
    console.log('✓ Thank-You email processing completed');
  } else {
    console.error('✗ Thank-You email processing failed:', thankYouResult.reason);
  }

  if (apiResult.status === 'fulfilled') {
    console.log('✓ External API processing completed');
  } else {
    console.error('✗ External API processing failed:', apiResult.reason);
  }
}

// Email sending function with proper error handling and fallback
async function sendContactEmail(inquiry) {
  try {
    const adminRecipient = process.env.EMAIL_USER || process.env.BDM_EMAIL || 'bdm@rndtechnosoft.com';
    const emailPass = process.env.EMAIL_PASS || process.env.BDM_PASS || process.env.OWNER_PASS;

    if (!adminRecipient || !emailPass) {
      throw new Error('Email configuration missing in environment variables.');
    }

    // HTML Email Template
    const emailHTML = generateContactEmailTemplate(inquiry);

    const ccRecipient = (process.env.OWNER_EMAIL && process.env.OWNER_EMAIL !== adminRecipient) ? process.env.OWNER_EMAIL : undefined;

    const mailOptions = {
      from: `"RND Technosoft Contact Form" <${adminRecipient}>`,
      to: adminRecipient,
      cc: ccRecipient,
      replyTo: inquiry.email, // Client can reply directly to inquirer
      subject: `New Contact Inquiry: ${inquiry.subject}`,
      html: emailHTML
    };

    console.log('Attempting to send contact email...');
    const emailResult = await sendMailWithFallback(mailOptions, 'user');
    console.log('✓ Contact email sent successfully:', emailResult.messageId);
    return emailResult;

  } catch (emailError) {
    console.error('✗ Contact email sending failed:', emailError.message);
    throw emailError;
  }
}

// External API call function
async function sendContactToExternalAPI(inquiry) {
  try {
    console.log('Attempting to send contact data to external API...');
    
    const apiKey = process.env.EXTERNAL_API_KEY || "A78A8BC90C6F6235";
    const apiId = process.env.EXTERNAL_API_ID || "MW1V";
    
    console.log('Using Contact API_ID:', apiId);
    
    const payload = {
      API_KEY: apiKey,
      API_ID: apiId,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      subject: inquiry.subject,
      message: inquiry.message
    };

    console.log('External API payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      'https://leads.rndtechnosoft.com/api/contactform/message',
      payload,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'RND-Contact-Portal/1.0'
        }
      }
    );
    
    console.log('✓ External API call successful:', response.data);
    return response.data;

  } catch (externalError) {
    console.error('✗ Failed to send contact data to external DB:', externalError.message);
    if (externalError.response) {
      console.error('External API Error Status:', externalError.response.status);
      console.error('External API Error Details:', externalError.response.data);
    }
    throw externalError;
  }
}

// Enhanced email template generator
function generateContactEmailTemplate(inquiry) {
  return `
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Inquiry</title>
    <style>
        body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f2;
            line-height: 1.6;
        }
        .container {
            width: 100%;
            max-width: 650px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
            border: 1px solid #1a1a1a;
        }

        /* ===== Header ===== */
        .header {
            background: linear-gradient(135deg, #3a3a3a 0%, #1c1c1c 55%, #0d0d0d 100%);
            color: #ffffff;
            padding: 34px 30px;
            text-align: center;
            position: relative;
            border-bottom: 4px solid #ffd333;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.6;
        }
        .logo-wrap {
            display: inline-block;
            background: #ffffff;
            border-radius: 10px;
            padding: 10px 18px;
            margin-bottom: 16px;
            position: relative;
            z-index: 1;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
        }
        .logo {
            width: 160px;
            height: auto;
            display: block;
        }
        .header h2 {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
            position: relative;
            z-index: 1;
            letter-spacing: 0.3px;
            color: #ffffff;
        }
        .header .sub-text {
            margin: 8px 0 0 0;
            font-size: 15px;
            color: #ffd333;
            position: relative;
            z-index: 1;
            font-weight: 500;
        }

        /* ===== Content ===== */
        .content {
            padding: 40px 30px;
            background-color: #ffffff;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
            margin-bottom: 28px;
        }
        .info-item {
            background: #fafafa;
            padding: 18px 20px;
            border-radius: 8px;
            border-left: 4px solid #ffd333;
            border-top: 1px solid #ececec;
            border-right: 1px solid #ececec;
            border-bottom: 1px solid #ececec;
            transition: transform 0.2s ease;
        }
        .info-label {
            font-size: 11px;
            font-weight: 700;
            color: #8a8a8a;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            margin-bottom: 8px;
            display: block;
        }
        .info-value {
            font-size: 16px;
            color: #111111;
            font-weight: 600;
            word-break: break-word;
        }

        /* ===== Message Section ===== */
        .message-section {
            background: #111111;
            padding: 26px;
            border-radius: 10px;
            margin-top: 22px;
        }
        .message-label {
            font-size: 13px;
            font-weight: 700;
            color: #ffd333;
            margin-bottom: 12px;
            display: block;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .message-content {
            color: #f0f0f0;
            font-size: 15px;
            line-height: 1.7;
            white-space: pre-wrap;
            background: #1c1c1c;
            padding: 20px;
            border-radius: 6px;
            border: 1px solid #2e2e2e;
        }

        /* ===== Action Button ===== */
        .action-buttons {
            text-align: center;
            margin: 28px 0 8px 0;
        }
        .btn {
            display: inline-block;
            background: #ffd333;
            color: #111111;
            padding: 13px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 700;
            font-size: 14px;
            box-shadow: 0 4px 14px rgba(255, 211, 51, 0.45);
            border: 2px solid #111111;
        }

        /* ===== Metadata ===== */
        .metadata {
            margin-top: 30px;
            padding: 20px;
            background: #fafafa;
            border: 1px solid #ececec;
            border-radius: 8px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        .metadata-item {
            font-size: 13px;
            color: #555555;
        }
        .metadata-label {
            font-weight: 700;
            color: #111111;
            display: block;
            margin-bottom: 4px;
        }
        .priority-badge {
            display: inline-block;
            background: #ffd333;
            color: #111111;
            font-weight: 700;
            font-size: 11px;
            padding: 3px 10px;
            border-radius: 12px;
            text-transform: uppercase;
        }

        /* ===== Footer ===== */
        .footer {
            background: #111111;
            color: #bdbdbd;
            padding: 26px 30px;
            text-align: center;
            font-size: 13px;
            border-top: 3px solid #ffd333;
        }
        .footer-logo {
            font-weight: 700;
            color: #ffd333;
            font-size: 15px;
            margin-bottom: 8px;
            letter-spacing: 0.3px;
        }

        @media (max-width: 600px) {
            .info-grid { grid-template-columns: 1fr; }
            .metadata { grid-template-columns: 1fr; }
            .container { margin: 10px; border-radius: 8px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <div class="header">
            <div class="logo-wrap">
                <img src="https://www.rndtechnosoft.com/api/logo/download/rndlogo.png" class="logo" alt="RND Technosoft Logo">
            </div>
            <h2>🔔 New Contact Inquiry</h2>
            <p class="sub-text">A potential client has reached out through your website</p>
        </div>

        <!-- Content Section -->
        <div class="content">
            <!-- Contact Information Grid -->
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Full Name</span>
                    <div class="info-value">${inquiry.name}</div>
                </div>
                <div class="info-item">
                    <span class="info-label">Email Address</span>
                    <div class="info-value">${inquiry.email}</div>
                </div>
                <div class="info-item">
                    <span class="info-label">Phone Number</span>
                    <div class="info-value">${inquiry.phone}</div>
                </div>
                <div class="info-item">
                    <span class="info-label">Subject</span>
                    <div class="info-value">${inquiry.subject}</div>
                </div>
            </div>

            <!-- Message Section -->
            <div class="message-section">
                <span class="message-label">📝 Message Details</span>
                <div class="message-content">${inquiry.message}</div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
                <a href="mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(inquiry.subject)}" class="btn">
                    📧 Reply to Client
                </a>
            </div>

            <!-- Metadata -->
            <div class="metadata">
                <div class="metadata-item">
                    <span class="metadata-label">Received Date</span>
                    ${new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">Received Time</span>
                    ${new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">Source</span>
                    Website Contact Form
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">Priority</span>
                    <span class="priority-badge">Normal</span>
                </div>
            </div>
        </div>

        <!-- Footer Section -->
        <div class="footer">
            <div class="footer-logo">RND Technosoft</div>
            <p>This is an automated notification from your website contact form.<br>
            Please respond to the client within 24 hours for best customer experience.</p>
        </div>
    </div>
</body>
</html>
  `;
}

// Get counts and data based on field presence
exports.getCountsAndData = async (req, res) => {
    try {
        const totalCount = await ContactInquiry.countDocuments();

        const countWithFields = await ContactInquiry.countDocuments({
            $or: [
                { utm_source: { $exists: true, $ne: '' } },
                { utm_medium: { $exists: true, $ne: '' } },
                { utm_campaign: { $exists: true, $ne: '' } },
                { utm_id: { $exists: true, $ne: '' } },
                { gclid: { $exists: true, $ne: '' } },
                { gcid_source: { $exists: true, $ne: '' } }
            ]
        });

        const countWithoutFields = await ContactInquiry.countDocuments({
            $nor: [
                { utm_source: { $exists: true, $ne: '' } },
                { utm_medium: { $exists: true, $ne: '' } },
                { utm_campaign: { $exists: true, $ne: '' } },
                { utm_id: { $exists: true, $ne: '' } },
                { gclid: { $exists: true, $ne: '' } },
                { gcid_source: { $exists: true, $ne: '' } }
            ]
        });

        const dataWithFields = await ContactInquiry.find({
            $or: [
                { utm_source: { $exists: true, $ne: '' } },
                { utm_medium: { $exists: true, $ne: '' } },
                { utm_campaign: { $exists: true, $ne: '' } },
                { utm_id: { $exists: true, $ne: '' } },
                { gclid: { $exists: true, $ne: '' } },
                { gcid_source: { $exists: true, $ne: '' } }
            ]
        }).sort({ createdAt: -1, _id: -1 });

        const dataWithoutFields = await ContactInquiry.find({
            $nor: [
                { utm_source: { $exists: true, $ne: '' } },
                { utm_medium: { $exists: true, $ne: '' } },
                { utm_campaign: { $exists: true, $ne: '' } },
                { utm_id: { $exists: true, $ne: '' } },
                { gclid: { $exists: true, $ne: '' } },
                { gcid_source: { $exists: true, $ne: '' } }
            ]
        }).sort({ createdAt: -1, _id: -1 });

        const inquiries = await ContactInquiry.find().sort({ createdAt: -1, _id: -1 });

        res.status(200).json({
            totalCount,
            countWithFields,
            countWithoutFields,
            dataWithFields,
            dataWithoutFields,
            inquiries
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteInquiry = async (req, res) => {
    const { id } = req.query;
    try {
        const deletedInquiry = await ContactInquiry.findByIdAndDelete(id);
        if (!deletedInquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }
        res.status(200).json({ message: 'Inquiry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
