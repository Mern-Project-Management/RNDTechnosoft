const PopupInquiry = require("../model/popupinquiry");
const { sendThankYouEmail, sendMailWithFallback } = require("../utils/emailService");

// POST: Create a new inquiry
const createPopupInquiry = async (req, res) => {
  try {
    // Create a new inquiry
    const newInquiry = new PopupInquiry(req.body);

    // Save to the database
    await newInquiry.save();

    const adminRecipient = process.env.EMAIL_USER || process.env.BDM_EMAIL || 'bdm@rndtechnosoft.com';
    const ccRecipient = (process.env.OWNER_EMAIL && process.env.OWNER_EMAIL !== adminRecipient) ? process.env.OWNER_EMAIL : undefined;

    // Prepare the email content for the admin
    const adminMailOptions = {
      from: `"RND Technosoft Popup Form" <${adminRecipient}>`,
      replyTo: newInquiry.email,
      to: adminRecipient,
      cc: ccRecipient,
      subject: "New Inquiry Received (Popup Form)",
      html: `
                <div style="text-align: center;">
                    <img src="https://www.rndtechnosoft.com/api/logo/download/photo_1743486518383.webp" alt="RND Technosoft Logo" style="width: 150px; height: auto;"/>
                    <h2>A new inquiry has been submitted</h2>
                    <p><strong>Name:</strong> ${newInquiry.name}</p>
                    <p><strong>Email:</strong> ${newInquiry.email}</p>
                    <p><strong>Mobile:</strong> ${newInquiry.mobile}</p>
                    <p><strong>Message:</strong> ${newInquiry.description}</p>
                </div>
            `,
    };

    // Send emails asynchronously
    try {
      await sendMailWithFallback(adminMailOptions);
    } catch (adminErr) {
      console.error('Failed to send admin popup notification email:', adminErr.message);
    }

    await sendThankYouEmail({
      to: newInquiry.email,
      name: newInquiry.name,
      subject: 'Thank You for Your Inquiry - RND Technosoft',
      formType: 'Popup Inquiry',
      inquiryDetails: {
        'Name': newInquiry.name,
        'Email': newInquiry.email,
        'Mobile': newInquiry.mobile,
        'Message': newInquiry.description
      }
    });

    // Send a success response
    res
      .status(201)
      .json({ message: "Inquiry submitted successfully", inquiry: newInquiry });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to submit inquiry", error: error.message });
  }
};

// GET: Retrieve all inquiries (optional, for admin or internal use)
const getPopupInquiries = async (req, res) => {
  try {
    const totalCount = await PopupInquiry.countDocuments();

    const countWithFields = await PopupInquiry.countDocuments({
        $or: [
            { utm_source: { $exists: true, $ne: '' } },
            { utm_medium: { $exists: true, $ne: '' } },
            { utm_campaign: { $exists: true, $ne: '' } },
            { utm_id: { $exists: true, $ne: '' } },
            { gclid: { $exists: true, $ne: '' } },
            { gcid_source: { $exists: true, $ne: '' } }
        ]
    });

    const countWithoutFields = await PopupInquiry.countDocuments({
        $nor: [
            { utm_source: { $exists: true, $ne: '' } },
            { utm_medium: { $exists: true, $ne: '' } },
            { utm_campaign: { $exists: true, $ne: '' } },
            { utm_id: { $exists: true, $ne: '' } },
            { gclid: { $exists: true, $ne: '' } },
            { gcid_source: { $exists: true, $ne: '' } }
        ]
    });

    const dataWithFields = await PopupInquiry.find({
        $or: [
            { utm_source: { $exists: true, $ne: '' } },
            { utm_medium: { $exists: true, $ne: '' } },
            { utm_campaign: { $exists: true, $ne: '' } },
            { utm_id: { $exists: true, $ne: '' } },
            { gclid: { $exists: true, $ne: '' } },
            { gcid_source: { $exists: true, $ne: '' } }
        ]
    }).sort({ createdAt: -1, _id: -1 });

    const dataWithoutFields = await PopupInquiry.find({
        $nor: [
            { utm_source: { $exists: true, $ne: '' } },
            { utm_medium: { $exists: true, $ne: '' } },
            { utm_campaign: { $exists: true, $ne: '' } },
            { utm_id: { $exists: true, $ne: '' } },
            { gclid: { $exists: true, $ne: '' } },
            { gcid_source: { $exists: true, $ne: '' } }
        ]
    }).sort({ createdAt: -1, _id: -1 });

    const inquiries = await PopupInquiry.find().sort({ createdAt: -1, _id: -1 });

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

const deleteCareerInquiry = async (req, res) => {
  
    const { id } = req.query;
    try {
        const deletedInquiry = await PopupInquiry.findByIdAndDelete(id);
        if (!deletedInquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }
        res.status(200).json({ message: 'Inquiry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  deleteCareerInquiry,
  createPopupInquiry,
  getPopupInquiries,
};
