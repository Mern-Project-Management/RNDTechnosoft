const Newsletter = require('../model/newsletter');
const { sendThankYouEmail } = require('../utils/emailService');


exports.addEmail = async (req, res) => {
    try {
        const { email, name } = req.body;

        // Check if the email already exists
        const existingEmail = await Newsletter.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already subscribed' });
        }

        const newEmail = new Newsletter({ email, name });
        await newEmail.save();

        // Send confirmation HTML email
        await sendThankYouEmail({
            to: email,
            name: name || 'Subscriber',
            subject: 'Welcome to RND Technosoft Newsletter!',
            formType: 'Newsletter Subscription',
            inquiryDetails: {
                'Subscriber Email': email
            }
        });

        res.status(201).json({ message: 'Email subscribed successfully and confirmation sent', data: newEmail });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// GET: Retrieve all subscribed emails
exports.getAllEmails = async (req, res) => {
    try {
        const emails = await Newsletter.find().sort({ createdAt: -1, _id: -1 });
        res.status(200).json(emails);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// DELETE: Remove an email from the newsletter by ID
exports.deleteEmail = async (req, res) => {
    try {
        const { id } = req.query;

        const deletedEmail = await Newsletter.findByIdAndDelete(id);
        if (!deletedEmail) {
            return res.status(404).json({ message: 'Email not found' });
        }

        res.status(200).json({ message: 'Email unsubscribed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
