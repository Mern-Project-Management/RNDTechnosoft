const CareerInquiry = require("../model/herosectioninquiry");
const path = require("path");
const { default: axios } = require("axios");
const { sendThankYouEmail, sendMailWithFallback } = require("../utils/emailService");

exports.CreateCareerInquiry = async (req, res) => {
  try {
    const newInquiry = new CareerInquiry({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      city: req.body.city,
      service: req.body.service,
      budget: req.body.budget,
    });
    console.log("newInquiry", newInquiry);

    await newInquiry.save();

    const logoImageUrl = "https://www.rndtechnosoft.com/api/logo/download/photo_1743486518383.webp";
    const logoStyle = "width: 100px; height: auto;";

    // HTML Email Template
    const emailHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Inquiry</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 10px; 
                max-width: 500px;
                margin: 20px auto;
                box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
            }
            h2 {
                color: #333;
                font-size: 24px;
                margin-bottom: 20px;
                text-align: center; /* Center the heading */
            }
            p {
                font-size: 16px;
                color: #555;
                line-height: 1.6;
            }
            .field {
                font-weight: bold;
                color: #333;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #aaa;
                text-align: center;
            }
            .centered-text {
                text-align: center; /* Center text */
                margin: 20px 0; /* Add margin above and below */
                font-size: 20px; /* Adjust font size as needed */
                color: #333; /* Text color */
            }
        </style>
      </head>
      <body>
        <div class="container">
            <img src="${logoImageUrl}" style="${logoStyle}" alt="RND Technosoft Logo"/>
            <p class="centered-text">New Inquiry!!</p>
            <p><span class="field">Name:</span> ${newInquiry.name}</p>
            <p><span class="field">Email:</span> ${newInquiry.email}</p>
            <p><span class="field">Phone:</span> ${newInquiry.phone}</p>
            <p><span class="field">City:</span> ${newInquiry.city}</p>
            <p><span class="field">Service:</span> ${newInquiry.service}</p>
            <p><span class="field">Budget:</span> ${newInquiry.budget}</p>
        </div>
      </body>
      </html>
      `;

    const adminRecipient = process.env.EMAIL_USER || process.env.BDM_EMAIL || 'bdm@rndtechnosoft.com';
    const ccRecipient = (process.env.OWNER_EMAIL && process.env.OWNER_EMAIL !== adminRecipient) ? process.env.OWNER_EMAIL : undefined;

    const mailOptions = {
      from: `"RND Technosoft Hero Section Form" <${adminRecipient}>`,
      replyTo: newInquiry.email,
      to: adminRecipient,
      cc: ccRecipient,
      subject: "New Inquiry Received (Hero Section)",
      html: emailHTML,
    };

    // Send email to admin
    try {
      await sendMailWithFallback(mailOptions);
    } catch (adminErr) {
      console.error('Failed to send admin hero inquiry email:', adminErr.message);
    }

    // Send thank you email to user
    await sendThankYouEmail({
      to: newInquiry.email,
      name: newInquiry.name,
      subject: 'Thank You for Your Inquiry - RND Technosoft',
      formType: 'Hero Section Inquiry',
      inquiryDetails: {
        'Name': newInquiry.name,
        'Email': newInquiry.email,
        'Phone': newInquiry.phone,
        'City': newInquiry.city || 'N/A',
        'Service': newInquiry.service || 'N/A',
        'Budget': newInquiry.budget || 'N/A'
      }
    });

    // Send data to external API
    try {
      await axios.post('https://leads.rndtechnosoft.com/api/contactform/message', {
        API_KEY: "A78A8BC90C6F6235",
        API_ID: "MW1V",
        name: newInquiry.name,
        email: newInquiry.email,
        phone: newInquiry.phone,
        subject: "Hero Section Inquiry",
        message: `Service: ${newInquiry.service || ''}, City: ${newInquiry.city || ''}, Budget: ${newInquiry.budget || ''}`
      });
    } catch (externalError) {
      console.error('Failed to send data to external DB:', externalError.message);
    }

    // Respond to the client
    res.status(201).json({ success: true, data: newInquiry, message: "Your message has been sent successfully! We will get back to you soon." });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
// Get counts and data based on field presence
exports.getCountsAndData = async (req, res) => {
  try {
    const totalCount = await CareerInquiry.countDocuments();

    const countWithFields = await CareerInquiry.countDocuments({
      $or: [
        { utm_source: { $exists: true, $ne: "" } },
        { utm_medium: { $exists: true, $ne: "" } },
        { utm_campaign: { $exists: true, $ne: "" } },
        { utm_id: { $exists: true, $ne: "" } },
        { gclid: { $exists: true, $ne: "" } },
        { gcid_source: { $exists: true, $ne: "" } },
      ],
    });

    const countWithoutFields = await CareerInquiry.countDocuments({
      $nor: [
        { utm_source: { $exists: true, $ne: "" } },
        { utm_medium: { $exists: true, $ne: "" } },
        { utm_campaign: { $exists: true, $ne: "" } },
        { utm_id: { $exists: true, $ne: "" } },
        { gclid: { $exists: true, $ne: "" } },
        { gcid_source: { $exists: true, $ne: "" } },
      ],
    });

    const dataWithFields = await CareerInquiry.find({
      $or: [
        { utm_source: { $exists: true, $ne: "" } },
        { utm_medium: { $exists: true, $ne: "" } },
        { utm_campaign: { $exists: true, $ne: "" } },
        { utm_id: { $exists: true, $ne: "" } },
        { gclid: { $exists: true, $ne: "" } },
        { gcid_source: { $exists: true, $ne: "" } },
      ],
    }).sort({ createdAt: -1, _id: -1 });

    const dataWithoutFields = await CareerInquiry.find({
      $nor: [
        { utm_source: { $exists: true, $ne: "" } },
        { utm_medium: { $exists: true, $ne: "" } },
        { utm_campaign: { $exists: true, $ne: "" } },
        { utm_id: { $exists: true, $ne: "" } },
        { gclid: { $exists: true, $ne: "" } },
        { gcid_source: { $exists: true, $ne: "" } },
      ],
    }).sort({ createdAt: -1, _id: -1 });

    const inquiries = await CareerInquiry.find().sort({ createdAt: -1, _id: -1 });

    res.status(200).json({
      totalCount,
      countWithFields,
      countWithoutFields,
      dataWithFields,
      dataWithoutFields,
      inquiries,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCareerInquiry = async (req, res) => {
  try {
    const { id } = req.query;
    const deletedInquiry = await CareerInquiry.findByIdAndDelete(id);

    if (!deletedInquiry) {
      return res.status(404).json({
        success: false,
        message: "Career inquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: deletedInquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete career inquiry",
      error: error.message,
    });
  }
};
