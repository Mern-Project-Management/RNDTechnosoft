// controllers/jobApplicationController.js
const JobApplication = require('../model/jobApplication');
const path = require('path');
const { sendThankYouEmail, getTransporter } = require('../utils/emailService');

// Create a new job application
exports.createJobApplication = async (req, res) => {
    try {
      // Handle resume file upload and store only the filename (without the path)
      const resumeFileName = req.files && req.files['resume'] ? req.files['resume'][0].filename : null;
  
      // Prepare the data to be saved in the database
      const jobApplicationData = {
        ...req.body, // Body data from the form
        resume: resumeFileName, // Store only the filename without the path
      };
  
      // Convert boolean fields to actual booleans
      jobApplicationData.smoke = jobApplicationData.smoke === 'Yes'; // Convert "Yes"/"No" to true/false
      jobApplicationData.alcohol = jobApplicationData.alcohol === 'Yes'; // Convert "Yes"/"No" to true/false
      jobApplicationData.differentlyAbled = jobApplicationData.differentlyAbled === 'Yes'; // Convert "Yes"/"No" to true/false
      jobApplicationData.policeRecord = jobApplicationData.policeRecord === 'Yes'; // Convert "Yes"/"No" to true/false
  
      // Convert totalExperience to number
      if (typeof jobApplicationData.totalExperience === 'string') {
        const experienceYears = jobApplicationData.totalExperience.match(/\d+/); // Extract numeric value
        jobApplicationData.totalExperience = experienceYears ? parseInt(experienceYears[0]) : 0;
      }
  
      // Create the new job application document
      const jobApplication = new JobApplication(jobApplicationData);
      await jobApplication.save();

      // Send HR notification & Candidate Thank You email asynchronously
      if (jobApplication.email) {
        sendThankYouEmail({
          to: jobApplication.email,
          name: jobApplication.fullName || jobApplication.name || 'Applicant',
          subject: 'Application Received - RND Technosoft',
          formType: 'Job Application',
          inquiryDetails: {
            'Applicant Name': jobApplication.fullName || jobApplication.name,
            'Email': jobApplication.email,
            'Phone': jobApplication.phone || jobApplication.mobileNo || 'N/A',
            'Position / Role': jobApplication.appliedPosition || 'N/A'
          },
          useHrAccount: true
        });

        if (process.env.EMAIL_HR) {
          try {
            const hrTransporter = getTransporter('hr');
            await hrTransporter.sendMail({
              from: `"RND Technosoft HR" <${process.env.EMAIL_HR}>`,
              to: process.env.EMAIL_HR,
              replyTo: jobApplication.email,
              subject: `New Job Application: ${jobApplication.fullName || jobApplication.name || 'Applicant'}`,
              html: `
                <h2>New Job Application Received</h2>
                <p><strong>Name:</strong> ${jobApplication.fullName || jobApplication.name}</p>
                <p><strong>Email:</strong> ${jobApplication.email}</p>
                <p><strong>Phone:</strong> ${jobApplication.phone || jobApplication.mobileNo}</p>
                <p><strong>Position:</strong> ${jobApplication.appliedPosition || 'N/A'}</p>
              `
            });
          } catch (hrErr) {
            console.error('Failed to send HR job application email:', hrErr.message);
          }
        }
      }
  
      res.status(201).json({ message: 'Job application created successfully', jobApplication });
    } catch (err) {
      res.status(500).json({ message: 'Error creating job application', error: err.message });
    }
  };
  
  

// Get all job applications
exports.getJobApplications = async (req, res) => {
  try {
    const jobApplications = await JobApplication.find().sort({ createdAt: -1, _id: -1 });
    res.status(200).json(jobApplications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching job applications', error: err.message });
  }
};

// Get a single job application by ID
exports.getJobApplicationById = async (req, res) => {
  try {
    const jobApplication = await JobApplication.findById(req.params.id);
    if (!jobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    res.status(200).json(jobApplication);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching job application', error: err.message });
  }
};

// Update a job application
exports.updateJobApplication = async (req, res) => {
    try {
      // Check if the resume file has been uploaded
      const resumeFilePath = req.files && req.files['resume'] ? path.join('resumes', req.files['resume'][0].filename) : null;
  
      // Prepare the data for updating the job application
      const updatedData = {
        ...req.body, // Body data from the form
        resume: resumeFilePath || req.body.resume // Keep the existing resume path if no new file uploaded
      };
  
      // Find and update the job application by ID
      const updatedJobApplication = await JobApplication.findByIdAndUpdate(req.params.id, updatedData, { new: true });
  
      if (!updatedJobApplication) {
        return res.status(404).json({ message: 'Job application not found' });
      }
  
      res.status(200).json(updatedJobApplication);
    } catch (err) {
      res.status(500).json({ message: 'Error updating job application', error: err.message });
    }
  };

// Delete a job application
exports.deleteJobApplication = async (req, res) => {
  try {
    const deletedJobApplication = await JobApplication.findByIdAndDelete(req.params.id);
    if (!deletedJobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    res.status(200).json({ message: 'Job application deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting job application', error: err.message });
  }
};
