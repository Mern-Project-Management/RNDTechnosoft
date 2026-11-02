const Logo = require('../model/logo'); 
const path = require('path');
const fs = require('fs');

// Get all images
const getAllLogos = async (req, res) => {
  try {
    const logos = await Logo.find();
    res.json(logos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new image
const addLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No logo file provided' });
    }

    const newLogo = new Logo({
      photo: req.file.filename,
      alt: req.body.alt,
      imgtitle:req.body.imgtitle,
      type: req.body.type
    });

    await newLogo.save();
    res.status(200).json({ message: 'Logo uploaded successfully', newLogo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an image
const deleteLogo = async (req, res) => {
  try {
    const { imageName } = req.params;

    // Find the document with the specific image name
    const imageDoc = await Logo.findOne({ photo: imageName });

    if (!imageDoc) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const imagePath = path.join(__dirname, '../logos', imageName);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    } else {
      console.warn(`File not found: ${imageName}`);
    }

    // Delete the document
    await Logo.findByIdAndDelete(imageDoc._id);

    res.json({ message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Download an image
const downloadLogo = (req, res) => {
  const { filename } = req.params;
  const candidates = [
    path.join(__dirname, '../logos', filename),
    path.join(__dirname, '../images', filename),
    path.join(__dirname, '../uploads', filename)
  ];

  let foundPath = null;
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      foundPath = p;
      break;
    }
  }

  if (!foundPath) {
    return res.status(404).json({ message: 'File not found' });
  }

  res.download(foundPath, (err) => {
    if (err && !res.headersSent) {
      console.error(err);
      res.status(500).json({ message: 'File download failed' });
    }
  });
};

const getHeaderColorLogos = async (req, res) => {
  try {
    const headerColorLogos = await Logo.findOne({ type: 'headerColor' });
    res.json(headerColorLogos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getHeaderWhiteLogos = async (req, res) => {
  try {
    const headerWhiteLogos = await Logo.findOne({ type: 'headerWhite' });
    res.json(headerWhiteLogos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFooterWhiteLogos = async (req, res) => {
  try {
    const footerWhiteLogos = await Logo.findOne({ type: 'footerWhite' });
    res.json(footerWhiteLogos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFooterColorLogos = async (req, res) => {
  try {
    const footerColorLogos = await Logo.findOne({ type: 'footerColor' });
    res.json(footerColorLogos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getFavicon = async (req, res) => {
  try {
    const favicon = await Logo.findOne({ type: 'favicon' });
    res.json(favicon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllLogos,
  addLogo,
  deleteLogo,
  downloadLogo,
  getHeaderColorLogos,
  getFooterWhiteLogos,
  getHeaderWhiteLogos,
  getFavicon,
  getFooterColorLogos
};
