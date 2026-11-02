const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authmiddleware');
const { postInquiry, getInquiries, deleteInquiries, getInquiriesById, UpdateInquirues } = require("../controller/inquiry");

// Get all inquiries
router.get('/getInquiries', getInquiries);
router.post('/addInquiry', postInquiry);
router.get('/getInquiryById', getInquiriesById);
router.delete('/deleteInquiries', deleteInquiries);
router.delete('/deleteInquiry', deleteInquiries);
router.put('/addInquiry', UpdateInquirues);

module.exports = router;
