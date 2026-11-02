const CareerInquiry = require('../model/carrerinquiry');
const path = require('path')
const { default: axios } = require('axios');
const { sendThankYouEmail, sendMailWithFallback } = require('../utils/emailService');

exports.CreateCareerInquiry = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    // Step 1: Save to database
    const newInquiry = new CareerInquiry({
      name: req.body.name,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      linkedin: req.body.linkedin || '',
      message: req.body.message,
      resume: req.files && req.files['resume'] ? req.files['resume'][0].filename : null,
      path: req.body.path
    });

    console.log('Attempting to save inquiry to database...');
    await newInquiry.save();
    console.log('✓ Inquiry saved to database successfully');

    // Send immediate response to client first
    res.status(201).json({ 
      success: true, 
      message: 'Inquiry submitted successfully',
      data: {
        id: newInquiry._id,
        name: newInquiry.name,
        email: newInquiry.email
      }
    });

    // Process email and external API asynchronously (non-blocking)
    processInquiryAsync(req, newInquiry);

  } catch (error) {
    console.error('✗ Main error in CreateCareerInquiry:', error);
    console.error('Error stack:', error.stack);
    
    res.status(400).json({ 
      success: false, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Async function to handle email and external API calls
async function processInquiryAsync(req, newInquiry) {
  const jobTitle = req.body.jobTitle || 'Career Inquiry';
  console.log('JobTitle:', jobTitle);

  // Process HR email, candidate thank you email, and external API in parallel
  const emailPromise = sendEmail(req, newInquiry, jobTitle);
  const thankYouPromise = sendThankYouEmail({
    to: newInquiry.email,
    name: newInquiry.name,
    subject: `Application Received - ${jobTitle} at RND Technosoft`,
    formType: 'Career Application',
    inquiryDetails: {
      'Position': jobTitle,
      'Applicant Name': newInquiry.name,
      'Email': newInquiry.email,
      'Mobile': newInquiry.mobileNo,
      'LinkedIn': newInquiry.linkedin || 'N/A'
    },
    useHrAccount: true
  });
  const externalApiPromise = sendToExternalAPI(newInquiry);

  // Execute all operations in parallel
  const [emailResult, thankYouResult, apiResult] = await Promise.allSettled([emailPromise, thankYouPromise, externalApiPromise]);

  // Log results
  if (emailResult.status === 'fulfilled') {
    console.log('✓ HR Email processing completed');
  } else {
    console.error('✗ HR Email processing failed:', emailResult.reason);
  }

  if (thankYouResult.status === 'fulfilled') {
    console.log('✓ Candidate Thank-You email processing completed');
  } else {
    console.error('✗ Candidate Thank-You email processing failed:', thankYouResult.reason);
  }

  if (apiResult.status === 'fulfilled') {
    console.log('✓ External API processing completed');
  } else {
    console.error('✗ External API processing failed:', apiResult.reason);
  }
}

// Optimized email sending function
async function sendEmail(req, newInquiry, jobTitle) {
  try {
    // HTML Email Template (moved to separate function for better readability)
    const emailHTML = generateEmailTemplate(newInquiry, jobTitle);

    const resumeFile = req.files && req.files['resume'] ? req.files['resume'][0] : null;
    console.log('Resume file:', resumeFile ? resumeFile.filename : 'No resume file');

    const recipient = process.env.OWNER_EMAIL || process.env.EMAIL_HR;
    if (!recipient) {
      throw new Error('Recipient environment variable is not configured');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"RND Technosoft Career Portal" <${recipient}>`,
      to: recipient,
      replyTo: newInquiry.email,
      subject: `${jobTitle} - ${newInquiry.name}`,
      html: emailHTML
    };

    // Add attachment only if resume file exists
    if (resumeFile) {
      mailOptions.attachments = [{
        filename: resumeFile.originalname,
        path: resumeFile.path,
        contentType: resumeFile.mimetype
      }];
      console.log('✓ Resume attachment added to email');
    }

    console.log('Attempting to send email...');
    const emailResult = await sendMailWithFallback(mailOptions);
    console.log('✓ Email sent successfully:', emailResult.messageId);
    return emailResult;

  } catch (emailError) {
    console.error('✗ Email sending failed:', emailError);
    throw emailError;
  }
}

// External API call function with improved error handling
async function sendToExternalAPI(newInquiry) {
  try {
    console.log('Attempting to send data to external API...');
    
    // Verify API credentials are configured
    const apiKey = process.env.EXTERNAL_API_KEY || "A78A8BC90C6F6235";
    const apiId = process.env.EXTERNAL_API_ID || "MW1V"; // Make this configurable
    
    console.log('Using API_ID:', apiId); // Debug log
    
    const payload = {
      API_KEY: apiKey,
      API_ID: apiId,
      name: newInquiry.name,
      email: newInquiry.email,
      phone: newInquiry.mobileNo,
      linkedin: newInquiry.linkedin || '',
      subject: "Career Inquiry",
      message: newInquiry.message,
      source: 'career-portal',
      ip_address: newInquiry.ipaddress || ''
    };

    console.log('External API request:', {
      url: 'https://leads.rndtechnosoft.com/api/contactform/message',
      method: 'POST',
      payload
    });

    const externalApiResponse = await axios.post(
      'https://leads.rndtechnosoft.com/api/contactform/message', 
      payload,
      {
        timeout: 15000, // Increased timeout to 15 seconds
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'RND-Career-Portal/1.0',
          'X-Request-Source': 'career-portal'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Handle all 2xx and 4xx responses
        }
      }
    );
    
    console.log('External API response:', {
      status: externalApiResponse.status,
      statusText: externalApiResponse.statusText,
      data: externalApiResponse.data
    });

    if (externalApiResponse.status !== 200) {
      throw new Error(`External API returned status ${externalApiResponse.status}: ${externalApiResponse.statusText}`);
    }

    console.log('✓ External API call successful:', externalApiResponse.data);
    return externalApiResponse.data;

  } catch (externalError) {
    console.error('✗ Failed to send data to external DB:', externalError.message);
    if (externalError.response) {
      console.error('External API Error Status:', externalError.response.status);
      console.error('External API Error Details:', externalError.response.data);
    }
    throw externalError;
  }
}

// Email template generator function
function generateEmailTemplate(inquiry, jobTitle) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Career Inquiry</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
          }
          .container {
              width: 100%;
              padding: 30px;
              background-color: #ffffff;
              border-radius: 12px; 
              max-width: 600px;
              margin: 30px auto;
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #f0f0f0;
          }
          .logo {
              width: 120px; 
              height: auto; 
              object-fit: contain;
              margin-bottom: 20px;
          }
          .title {
              font-size: 24px;
              color: #2c3e50;
              margin: 0;
              font-weight: 600;
          }
          .subtitle {
              font-size: 16px;
              color: #7f8c8d;
              margin: 5px 0 0 0;
          }
          .content {
              padding: 20px 0;
          }
          .field-row {
              margin: 15px 0;
              padding: 12px;
              background-color: #f8f9fa;
              border-radius: 6px;
              border-left: 4px solid #3498db;
          }
          .field-label {
              font-weight: 600;
              color: #2c3e50;
              display: block;
              margin-bottom: 5px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
          }
          .field-value {
              color: #34495e;
              font-size: 16px;
              line-height: 1.5;
              word-break: break-word;
          }
          .message-field {
              background-color: #fff;
              border: 1px solid #e1e5e9;
              padding: 15px;
              border-radius: 6px;
              margin-top: 10px;
          }
          .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ecf0f1;
              font-size: 12px;
              color: #95a5a6;
              text-align: center;
          }
      </style>
    </head>
    <body>
      <div class="container">
          <div class="header">
              <img class="logo" src="https://www.rndtechnosoft.com/api/logo/download/photo_1743486518383.webp" alt="RND Technosoft Logo">
              <h1 class="title">New ${jobTitle} Application</h1>
              <p class="subtitle">Career Portal Submission</p>
          </div>
          
          <div class="content">
              <div class="field-row">
                  <span class="field-label">Applicant Name</span>
                  <div class="field-value">${inquiry.name}</div>
              </div>
              
              <div class="field-row">
                  <span class="field-label">Email Address</span>
                  <div class="field-value">${inquiry.email}</div>
              </div>
              
              <div class="field-row">
                  <span class="field-label">Phone Number</span>
                  <div class="field-value">${inquiry.mobileNo}</div>
              </div>
              
              ${inquiry.linkedin ? `
              <div class="field-row">
                  <span class="field-label">LinkedIn Profile</span>
                  <div class="field-value"><a href="${inquiry.linkedin}" target="_blank">${inquiry.linkedin}</a></div>
              </div>
              ` : ''}
              
              <div class="field-row">
                  <span class="field-label">Application Path</span>
                  <div class="field-value">${inquiry.path || 'Not specified'}</div>
              </div>
              
              <div class="field-row">
                  <span class="field-label">Message</span>
                  <div class="message-field">${inquiry.message}</div>
              </div>
          </div>
          
          <div class="footer">
              <p>This email was generated automatically by the RND Technosoft Career Portal.</p>
              <p>Application submitted on: ${new Date().toLocaleString()}</p>
          </div>
      </div>
    </body>
    </html>
  `;
}

// Optional: Add email configuration optimization
function configureEmailTransporter() {
  // Make sure your transporter is configured with connection pooling
  const nodemailer = require('nodemailer');
  
  return nodemailer.createTransporter({
    // Your email service configuration
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Performance optimizations
    pool: true, // Enable connection pooling
    maxConnections: 5, // Limit concurrent connections
    maxMessages: 100, // Messages per connection
    rateLimit: 14, // Max emails per second
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  });
}


// Get counts and data based on field presence
exports.getCountsAndData = async (req, res) => {
  try {
    const totalCount = await CareerInquiry.countDocuments();

    const countWithFields = await CareerInquiry.countDocuments({
      $or: [
        { utm_source: { $exists: true, $ne: '' } },
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    });

    const countWithoutFields = await CareerInquiry.countDocuments({
      $nor: [
        { utm_source: { $exists: true, $ne: '' } },
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    });

    const dataWithFields = await CareerInquiry.find({
      $or: [
        { utm_source: { $exists: true, $ne: '' } }, 
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    }).sort({ createdAt: -1, _id: -1 });

    const dataWithoutFields = await CareerInquiry.find({
      $nor: [
        { utm_source: { $exists: true, $ne: '' } },
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    }).sort({ createdAt: -1, _id: -1 });

    const inquiries = await CareerInquiry.find().sort({ createdAt: -1, _id: -1 });

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

// exports.CreateCareerInquiry = async (req, res) => {
//   try {
//     const { name, mobileNo, email, message } = req.body;
//     const resume = req.files.resume[0].filename; // Get the resume filename from the uploaded files

//     // Create a new CareerInquiry document
//     const newInquiry = new CareerInquiry({
//       name,
//       mobileNo,
//       email,
//       resume,
//       message,
//     });

//     // Save the inquiry to the database
//     const savedInquiry = await newInquiry.save();

//     res.status(201).json({
//       success: true,
//       data: savedInquiry,
//     });
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({
//       success: false,
//       message: 'Failed to post career inquiry',
//       error: error.message,
//     });
//   }
// };

// exports.getAllCareerInquiries = async (req, res) => {
//   try {
//     const inquiries = await CareerInquiry.find().sort({ createdAt: -1, _id: -1 });

//     res.status(200).json({
//       success: true,
//       data: inquiries,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch career inquiries',
//       error: error.message,
//     });
//   }
// };

exports.deleteCareerInquiry = async (req, res) => {
  try {
    const { id } = req.query
    const deletedInquiry = await CareerInquiry.findByIdAndDelete(id);

    if (!deletedInquiry) {
      return res.status(404).json({
        success: false,
        message: 'Career inquiry not found',
      });
    }

    res.status(200).json({
      success: true,
      data: deletedInquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete career inquiry',
      error: error.message,
    });
  }
};


exports.downloadResume = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../resumes', filename);

  res.download(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'File download failed' });
    }
  });
};

exports.viewResume = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'resumes', filename);
  res.sendFile(filePath);
};
