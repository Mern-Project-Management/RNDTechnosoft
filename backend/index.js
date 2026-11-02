require('dotenv').config();
const dns = require('dns');

// Configure DNS servers (resolves MongoDB Atlas querySrv ECONNREFUSED/ENOTFOUND issues)
if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(',').map(s => s.trim()));
} else {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const { generateAllSitemaps } = require('./routes/mySitemap');
const { exportAndBackupAllCollectionsmonthly } = require('./controller/Backup');
const fs = require('fs').promises;
const compression = require('compression');
const cookieParser = require('cookie-parser');
const generateMetaTags = require('./middleware/metaTagInfo');
const app = express();
app.use(cookieParser()); 
app.use(compression({ threshold: 1024 }));
// Middleware
app.use(cors({ 
    origin: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));

app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.get('/portfolio', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'portfolio.pdf');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="portfolio.pdf"');
  res.sendFile(filePath, (err) => {
      if (err) {
          console.error('Error sending portfolio PDF:', err);
          res.status(500).send('Error loading portfolio');
      }
  });
});

app.get('/portfolio', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'portfolio.pdf');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="portfolio.pdf"');
  res.sendFile(filePath, (err) => {
      if (err) {
          console.error('Error sending portfolio PDF:', err);
          res.status(500).send('Error loading portfolio');
      }
  });
});
app.get('/sitemap.xml', async (req, res) => {
    try {
        let filePath = path.join(__dirname, 'public', 'sitemap.xml'); // Local variable
      try {
        // First try in dist directory
        await fs.access(filePath);
      } catch (error) {
        // If not found in dist, try in public directory
        filePath = path.join(__dirname, 'public', 'sitemap.xml');
        try {
          await fs.access(filePath);
        } catch (err) {
          console.error('Sitemap not found in either location:', err);
          return res.status(404).send('Sitemap not found');
        }
      }
      
      // Read the file
      const data = await fs.readFile(filePath);
      res.set('Content-Type', 'application/xml');
      res.send(data);
    } catch (err) {
      console.error('Error serving sitemap:', err);
      return res.status(500).send('Error serving sitemap');
    }
  });
  // Update your sitemap route to use fs.promises correctly
app.get('/sitemap1.xml', async (req, res) => {
    try {
        let filePath = path.join(__dirname, 'public', 'sitemap1.xml'); // Local variable
      try {
        // First try in dist directory
        await fs.access(filePath);
      } catch (error) {
        // If not found in dist, try in public directory
        filePath = path.join(__dirname, 'public', 'sitemap1.xml');
        try {
          await fs.access(filePath);
        } catch (err) {
          console.error('Sitemap not found in either location:', err);
          return res.status(404).send('Sitemap not found');
        }
      }
      
      // Read the file
      const data = await fs.readFile(filePath);
      res.set('Content-Type', 'application/xml');
      res.send(data);
    } catch (err) {
      console.error('Error serving sitemap:', err);
      return res.status(500).send('Error serving sitemap');
    }
  });

app.get('/blog-sitemap.xml', async (req, res) => {
    try {
        let filePath = path.join(__dirname, 'public', 'blog-sitemap.xml'); // Local variable
      try {
        // First try in dist directory
        await fs.access(filePath);
      } catch (error) {
        // If not found in dist, try in public directory
        filePath = path.join(__dirname, 'public', 'blog-sitemap.xml');
        try {
          await fs.access(filePath);
        } catch (err) {
          console.error('Sitemap not found in either location:', err);
          return res.status(404).send('Sitemap not found');
        }
      }
      
      // Read the file
      const data = await fs.readFile(filePath);
      res.set('Content-Type', 'application/xml');
      res.send(data);
    } catch (err) {
      console.error('Error serving sitemap:', err);
      return res.status(500).send('Error serving sitemap');
    }
  });

app.get('/industrial-category-sitemap.xml', async (req, res) => {
    try { 
      let filePath = path.join(__dirname, 'public', 'industrial-category-sitemap.xml'); // Local variable    
      try {
        // First try in dist directory
        await fs.access(filePath);
      } catch (error) {
        // If not found in dist, try in public directory
        filePath = path.join(__dirname, 'public', 'industrial-category-sitemap.xml');
        try {
          await fs.access(filePath);
        } catch (err) {
          console.error('Sitemap not found in either location:', err);
          return res.status(404).send('Sitemap not found');
        }
      }
      
      // Read the file
      const data = await fs.readFile(filePath);
      res.set('Content-Type', 'application/xml');
      res.send(data);
    } catch (err) {
      console.error('Error serving sitemap:', err);
      return res.status(500).send('Error serving sitemap');
    }
  });  

app.get('/industrial-subcategory-sitemap.xml', async (req, res) => {
    try {
      // Look for sitemap in both possible locations
      let filePath = path.join(__dirname, 'dist', 'industrial-subcategory-sitemap.xml');
      
      try {
        // First try in dist directory
        await fs.access(filePath);
      } catch (error) {
        // If not found in dist, try in public directory
        filePath = path.join(__dirname, 'public', 'industrial-subcategory-sitemap.xml');
        try {
          await fs.access(filePath);
        } catch (err) {
          console.error('Sitemap not found in either location:', err);
          return res.status(404).send('Sitemap not found');
        }
      }
      
      // Read the file
      const data = await fs.readFile(filePath);
      res.set('Content-Type', 'application/xml');
      res.send(data);
    } catch (err) {
      console.error('Error serving sitemap:', err);
      return res.status(500).send('Error serving sitemap');
    }
  }); 

app.get('/package-category-sitemap.xml', async (req, res) => {
    try {
      // Look for sitemap in both possible locations
      let filePath = path.join(__dirname, 'public', 'package-category-sitemap.xml');
      
      try {
        // First try in dist directory
        await fs.access(filePath);
      } catch (error) {
        // If not found in dist, try in public directory
        filePath = path.join(__dirname, 'public', 'package-category-sitemap.xml');
        try {
          await fs.access(filePath);
        } catch (err) {
          console.error('Sitemap not found in either location:', err);
          return res.status(404).send('Sitemap not found');
        }
      }
      
      // Read the file
      const data = await fs.readFile(filePath);
      res.set('Content-Type', 'application/xml');
      res.send(data);
    } catch (err) {
      console.error('Error serving sitemap:', err);
      return res.status(500).send('Error serving sitemap');
    }
  });

app.get('/package-subcategory-sitemap.xml', async (req, res) => {
    try {
      // Look for sitemap in both possible locations
      let filePath = path.join(__dirname, 'public', 'package-subcategory-sitemap.xml');
      
      try {
        // First try in dist directory
        await fs.access(filePath);
      } catch (error) {
        // If not found in dist, try in public directory
        filePath = path.join(__dirname, 'public', 'package-subcategory-sitemap.xml');
        try {
          await fs.access(filePath);
        } catch (err) {
          console.error('Sitemap not found in either location:', err);
          return res.status(404).send('Sitemap not found');
        }
      }
      
      // Read the file
      const data = await fs.readFile(filePath);
      res.set('Content-Type', 'application/xml');
      res.send(data);
    } catch (err) {
      console.error('Error serving sitemap:', err);
      return res.status(500).send('Error serving sitemap');
    }
  });

app.get('/package-subsubcategory-sitemap.xml', async (req, res) => {
    try {
      // Look for sitemap in both possible locations
      let filePath = path.join(__dirname, 'public', 'package-subsubcategory-sitemap.xml');
      
      try {
        // First try in dist directory
        await fs.access(filePath);
      } catch (error) {
        // If not found in dist, try in public directory
        filePath = path.join(__dirname, 'public', 'package-subsubcategory-sitemap.xml');
        try {
          await fs.access(filePath);
        } catch (err) {
          console.error('Sitemap not found in either location:', err);
          return res.status(404).send('Sitemap not found');
        }
      }
      
      // Read the file
      const data = await fs.readFile(filePath);
      res.set('Content-Type', 'application/xml');
      res.send(data);
    } catch (err) {
      console.error('Error serving sitemap:', err);
      return res.status(500).send('Error serving sitemap');
    }
  });

app.get('/portfolio-category-sitemap.xml', async (req, res) => {
    try {
      // Look for sitemap in both possible locations
      let filePath = path.join(__dirname, 'public', 'portfolio-category-sitemap.xml');
      
      try {
        // First try in dist directory
        await fs.access(filePath);
      } catch (error) {
        // If not found in dist, try in public directory
        filePath = path.join(__dirname, 'public', 'portfolio-category-sitemap.xml');
        try {
          await fs.access(filePath);
        } catch (err) {
          console.error('Sitemap not found in either location:', err);
          return res.status(404).send('Sitemap not found');
        }
      }
      
      // Read the file
      const data = await fs.readFile(filePath);
      res.set('Content-Type', 'application/xml');
      res.send(data);
    } catch (err) {
      console.error('Error serving sitemap:', err);
      return res.status(500).send('Error serving sitemap');
    }
  });

app.get('/service-subcategories-sitemap.xml', async (req, res) => {
    try {
      // Look for sitemap in both possible locations
      let filePath = path.join(__dirname, 'public', 'service-subcategories-sitemap.xml');
      
      try {
        // First try in dist directory
        await fs.access(filePath);
      } catch (error) {
        // If not found in dist, try in public directory
        filePath = path.join(__dirname, 'public', 'service-subcategories-sitemap.xml');
        try {
          await fs.access(filePath);
        } catch (err) {
          console.error('Sitemap not found in either location:', err);
          return res.status(404).send('Sitemap not found');
        }
      }
      
      // Read the file
      const data = await fs.readFile(filePath);
      res.set('Content-Type', 'application/xml');
      res.send(data);
    } catch (err) {
      console.error('Error serving sitemap:', err);
      return res.status(500).send('Error serving sitemap');
    }
  });

app.get('/service-subsubcategories-sitemap.xml', async (req, res) => {
    try {
      // Look for sitemap in both possible locations
      let filePath = path.join(__dirname, 'public', 'service-subsubcategories-sitemap.xml');
      
      try {
        // First try in dist directory
        await fs.access(filePath);
      } catch (error) {
        // If not found in dist, try in public directory
        filePath = path.join(__dirname, 'public', 'service-subsubcategories-sitemap.xml');
        try {
          await fs.access(filePath);
        } catch (err) {
          console.error('Sitemap not found in either location:', err);
          return res.status(404).send('Sitemap not found');
        }
      }
      
      // Read the file
      const data = await fs.readFile(filePath);
      res.set('Content-Type', 'application/xml');
      res.send(data);
    } catch (err) {
      console.error('Error serving sitemap:', err);
      return res.status(500).send('Error serving sitemap');
    }
  });  

app.get('/robots.txt', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'public', 'robots.txt');
        const data = await fs.readFile(filePath);
        res.set('Content-Type', 'text/plain');
        res.send(data);
    } catch (err) {
        console.error('Error serving robots.txt:', err);
        res.status(404).send('robots.txt not found');
    }
});
 
app.get('*', generateMetaTags);
// Cron Job for Daily Sitemap Generation
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Generating daily sitemaps via cron job');
        await generateAllSitemaps();
        console.log('Daily sitemap generation completed');
    } catch (error) {
        console.error('Error generating daily sitemaps:', error);
    }
}, {
    scheduled: true,
    timezone: 'Asia/Kolkata',
});

// Cron Job for Monthly Backup
cron.schedule('59 23 31 * *', () => {
    exportAndBackupAllCollectionsmonthly();
}, {
    scheduled: true,
    timezone: 'Asia/Kolkata',
});

// API Routes
app.get('/api/generate-sitemaps', async (req, res) => {
    try {
        await generateAllSitemaps();
        res.status(200).json({ message: 'Sitemaps generated successfully' });
    } catch (error) {
        console.error('Error generating sitemaps:', error);
        res.status(500).json({ error: 'Failed to generate sitemaps' });
    }
});


// Other API Routes
app.use('/api/product', require('./routes/product'));
app.use('/api/services', require('./routes/services'));
app.use('/api/news', require('./routes/news'));
app.use('/api/pageHeading', require('./routes/pageHeading'));
app.use('/api/image', require('./routes/image'));
app.use('/api/testimonial', require('./routes/testinomial'));
app.use('/api/faq', require('./routes/FAQ'));
app.use('/api/staff', require('./routes/ourStaff'));
app.use('/api/banner', require('./routes/Banner'));
app.use('/api/pageContent', require('./routes/pageContent'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/password', require('./routes/forgotpassword'));
app.use('/api/email', require('./routes/email'));
app.use('/api/logo', require('./routes/logo'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/catalogue', require('./routes/catalogueInquiry')); 
app.use('/api/download', require('./routes/portfolioRoutes')); 
app.use('/api/aboutusPoints', require('./routes/aboutuspoints'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/counter', require('./routes/counter'));
app.use('/api/inquiries', require('./routes/inquiry'));
app.use('/api/mission', require('./routes/mission'));
app.use('/api/vision', require('./routes/vision'));
app.use('/api/corevalue', require('./routes/corevalue'));
app.use('/api/aboutcompany', require('./routes/aboutcompany'));
app.use('/api/careeroption', require('./routes/careeroption'));
app.use('/api/careerInquiries', require('./routes/careerinquiry'));
app.use('/api/footer', require('./routes/footer'));
app.use('/api/header', require('./routes/header'));
app.use('/api/globalpresence', require('./routes/globalpresence'));
app.use('/api/whatsappsettings', require('./routes/whatsappsettings'));
app.use('/api/googlesettings', require('./routes/googlesettings'));
app.use('/api/menulisting', require('./routes/menulisting'));
app.use('/api/navbar', require('./routes/NavData'));
app.use('/api/infrastructure', require('./routes/infrastructure'));
app.use('/api/qualitycontrol', require('./routes/qualitycontrol'));
app.use('/api/sitemap', require('./routes/sitemap'));
app.use('/api/benefits', require('./routes/benefits'));
app.use('/api/herosection', require('./routes/heroSection'));
app.use('/api/serviceDetails', require('./routes/serviceDetails'));
app.use('/api/homehero', require('./routes/HomeHero'));
app.use('/api/homepage', require('./routes/homepage'));
app.use('/api/video', require('./routes/video')); 
app.use('/api/serviceImages', require('./routes/serviceImage'));
app.use('/api/industryImages', require('./routes/industryimage'));
app.use('/api/packages', require('./routes/plan'));
app.use('/api/designProcess', require('./routes/designProcess'));
app.use('/api/content', require('./routes/content'));
app.use('/api/submenulisting', require('./routes/submenu'));
app.use('/api/industries', require('./routes/industries'));
app.use('/api/industiesHeroSection', require('./routes/industriesHeroSection'));
app.use('/api/industiesDetails', require('./routes/industriesdetails'));
app.use('/api/portfolio', require('./routes/portfoliocategory'));
app.use('/api/navbar', require('./routes/navbardata'));
app.use('/api/contactInfo', require('./routes/contactInfo'));
app.use('/api/icon', require('./routes/contactIcon'));
app.use('/api/address', require('./routes/address'));
app.use('/api/contactinquiries', require('./routes/contactinquiry'));
app.use('/api/colors', require('./routes/managecolor'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/card', require('./routes/cards'));
app.use('/api/home', require('./routes/homeanimation'));
app.use('/api/popupinquiry', require('./routes/popupinquiry'));
app.use('/api/herosectioninquiry', require('./routes/herosectioninquiry'));
app.use('/api/logotype', require('./routes/logotype'));
app.use('/api/packagedescription', require('./routes/packagedescription'));
app.use('/api/allData', require('./combineApi/combineRoute'));
app.use('/api/allData2', require('./combineApi/combineRoute2'));
app.use('/api/jobApplication', require('./routes/jobApplication'));
app.use('/api/cache', require('./routes/cache'));
app.use('/api/staticMeta', require('./routes/staticMeta'));
app.use('/api/all-inquiries', require('./routes/allInquiries'));
app.use('/api/techCategory', require('./routes/techCategory'));
app.use('/api/technology', require('./routes/technology'));
app.use('/api/technologySecData', require('./routes/technologySecData'));
app.use('/api/caseStudy', require('./routes/caseStudy'));
app.use('/api/hire-talent', require('./routes/hire_telent'));
app.use('/api/subsections', require('./routes/subSection'));


// Swagger Setup 
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swaggerConfig');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Static Files (After Sitemap and API Routes)
// Route to serve the portfolio PDF


app.use(express.static(path.join(__dirname, 'dist'), {
    setHeaders: (res, filePath) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    },
}));
 
// Error handling middleware in index.js
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // Default to 500 if no status code
  err.status = err.status || 'error'; // Default to 'error' for status message

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
// Catch-All Route for SPA (Last)
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : undefined,
    });
});

// Error handling middleware in index.js
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // Default to 500 if no status code
  err.status = err.status || 'error'; // Default to 'error' for status message

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
 
// Server Initialization
async function startServer() {
    try {
         await mongoose.connect(process.env.DATABASE_URI, {
         serverSelectionTimeoutMS: 10000,
         socketTimeoutMS: 60000,
         maxPoolSize: 10,
         minPoolSize: 2,
     });
        console.log('Connected to MongoDB');
        // generateAllSitemaps()
        const port = process.env.PORT || 3041;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Server initialization error:', error);
        process.exit(1);
    }
}
 
startServer(); 