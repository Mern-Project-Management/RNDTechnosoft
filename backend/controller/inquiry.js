const { default: axios } = require("axios");
const Inquiry = require("../model/inquiry");
const { sendThankYouEmail, sendMailWithFallback } = require('../utils/emailService');

const postInquiry = async (req, res) => {
  try {
    const inquiryData = { ...req.body };
    const newInquiry = new Inquiry(inquiryData);
    const savedInquiry = await newInquiry.save();

    const logoImageUrl = "https://www.rndtechnosoft.com/api/logo/download/photo_1743486518383.webp";
    const logoStyle = "width: 100px; height: auto;";

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
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
              }
              h2 {
                  color: #333;
                  text-align: center;
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
          </style>
      </head>
      <body>
          <div class="container">
              <div style="display: inline-block; background: #111111; border-radius: 10px; padding: 10px 18px; border: 1px solid #ffd333; margin-bottom: 12px; text-align: center;"><img src="${logoImageUrl}" style="width: 150px; height: auto; display: block;" alt="RND Technosoft Logo"/></div>
              <h2>New Inquiry</h2>
              <p><span class="field">First Name:</span> ${newInquiry.firstname || newInquiry.name || ''}</p>
              <p><span class="field">Last Name:</span> ${newInquiry.lastname || ''}</p>
              <p><span class="field">Email:</span> ${newInquiry.email}</p>
              <p><span class="field">Mobile No:</span> ${newInquiry.mobileNo || newInquiry.phone || ''}</p>
              <p><span class="field">Company Size:</span> ${newInquiry.companysize || 'N/A'}</p>
              <p><span class="field">Active User:</span> ${newInquiry.activeuser || 'N/A'}</p>
              <p><span class="field">Topic:</span> ${newInquiry.topic || 'General Inquiry'}</p>
              <p><span class="field">Message:</span> ${newInquiry.message || ''}</p>
              <div class="footer">
                  <p>This is an automated email. Please do not reply.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const adminRecipient = process.env.EMAIL_USER || process.env.BDM_EMAIL || 'bdm@rndtechnosoft.com';
    const ccRecipient = (process.env.OWNER_EMAIL && process.env.OWNER_EMAIL !== adminRecipient) ? process.env.OWNER_EMAIL : undefined;

    const adminEmailOptions = {
      from: `"RND Technosoft Inquiry" <${adminRecipient}>`,
      to: adminRecipient,
      cc: ccRecipient,
      replyTo: savedInquiry.email,
      subject: 'New Inquiry Submitted',
      html: emailHTML
    };

    // Send admin email & thank you email safely
    try {
      await sendMailWithFallback(adminEmailOptions);
    } catch (adminMailError) {
      console.error('Failed to send admin inquiry notification email:', adminMailError.message);
    }

    const clientName = `${inquiryData.firstname || ''} ${inquiryData.lastname || ''}`.trim() || inquiryData.name || 'Valued Customer';

    await sendThankYouEmail({
      to: savedInquiry.email,
      name: clientName,
      subject: 'Thank You for Your Inquiry - RND Technosoft',
      formType: 'General Inquiry',
      inquiryDetails: {
        'Topic': savedInquiry.topic || 'General Inquiry',
        'Mobile': savedInquiry.mobileNo || savedInquiry.phone || 'N/A',
        'Message': savedInquiry.message || ''
      }
    });

    // Send data to external API
    try {
      await axios.post('https://leads.rndtechnosoft.com/api/contactform/message', {
        API_KEY: "A78A8BC90C6F6235",
        API_ID: "MW1V",
        name: clientName,
        email: newInquiry.email,
        phone: newInquiry.mobileNo,
        subject: "General Inquiry",
        message: newInquiry.message,
        path: newInquiry.path,
      });
    } catch (externalError) {
      console.error('Failed to send data to external DB:', externalError.message);
    }

    res.status(201).json({
      message: 'Inquiry created successfully and emails sent',
      data: savedInquiry,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create inquiry',
      error: error.message,
    });
  }
};


const getInquiries = async (req, res) => {
  try {
    const totalCount = await Inquiry.countDocuments();

    const countWithFields = await Inquiry.countDocuments({
      $or: [
        { utm_source: { $exists: true, $ne: '' } },
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    });

    const countWithoutFields = await Inquiry.countDocuments({
      $nor: [
        { utm_source: { $exists: true, $ne: '' } },
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    });

    const dataWithFields = await Inquiry.find({
      $or: [
        { utm_source: { $exists: true, $ne: '' } },
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    }).sort({ createdAt: -1, _id: -1 });

    const dataWithoutFields = await Inquiry.find({
      $nor: [
        { utm_source: { $exists: true, $ne: '' } },
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    }).sort({ createdAt: -1, _id: -1 });

    const inquiries = await Inquiry.find().sort({ createdAt: -1, _id: -1 });

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

const getInquiriesById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.query.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.status(200).json(inquiry);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve inquiry',
      error: error.message,
    });
  }
}

const UpdateInquirues = async (req, res) => {
  try {
    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.query.id,
      { ...req.body },
      { new: true, runValidators: true } // Return the updated document
    );
    if (!updatedInquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.status(200).json({
      message: 'Inquiry updated successfully',
      data: updatedInquiry,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update inquiry',
      error: error.message,
    });
  }
}

const deleteInquiries = async (req, res) => {
  try {
    const deletedInquiry = await Inquiry.findByIdAndDelete(req.query.id);
    if (!deletedInquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.status(200).json({
      message: 'Inquiry deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete inquiry',
      error: error.message,
    });
  }
}

module.exports = { postInquiry, getInquiries, deleteInquiries, getInquiriesById, UpdateInquirues };
