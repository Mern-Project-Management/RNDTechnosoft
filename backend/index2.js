
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
const serveStatic = require('serve-static');
const path = require('path');
const cron = require('node-cron');
const {exportAndBackupAllCollectionsmonthly} = require("./controller/Backup")
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fs = require('fs').promises;
const http = require('http');

const app = express();



app.use(cors());



// Static file serving with open access
app.use(express.static(path.join(__dirname, 'dist'), {
setHeaders: (res, path) => {
res.setHeader('Access-Control-Allow-Origin', '*');
if (path.endsWith('.js')) {
res.setHeader('Content-Type', 'application/javascript');
}
if (path.endsWith('.css')) {
res.setHeader('Content-Type', 'text/css');
}
}
}));



// Catch-all route for SPA with open access
app.get('*', (req, res) => {
res.sendFile(path.join(__dirname, 'dist', 'index.html')
);
});

// Error handler for CORS
app.use((err, req, res, next) => {
if (err.message === 'CORS Error') {
console.warn('CORS Warning:', err);
// Continue despite CORS error
next();
} else {
next(err);
}
});

const port = process.env.PORT || 3006;
// Rate limiting
const limiter = rateLimit({
windowMs: 15 * 60 * 1000, // 15 minutes
max: 300, // Limit each IP to 300 requests per windowMs
message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Request logging middleware
app.use((req, res, next) => {
conststart = Date.now();
res.on('finish', () => {
constduration = Date.now() - start;
console.log(`${req.method}${req.url}${res.statusCode}${duration}ms`);
});
next();
});

// Error handling middleware
app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).json({
error: 'Something went wrong!',
message: process.env.NODE_ENV === 'development'?err.message: undefined
});
});

// Increase body size limit for JSON requests
app.use(bodyParser.json({ limit: '50mb' })); // Adjust the size limit as needed

// Increase body size limit for URL-encoded requests
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());

app.use(cookieParser());



// Use routes
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
app.use('/api/password',require('./routes/forgotpassword'));
app.use('/api/email', require('./routes/email'));
app.use('/api/logo', require('./routes/logo'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/aboutusPoints', require('./routes/aboutuspoints'));
app.use("/api/achievements",require('./routes/achievements'))
app.use("/api/counter",require('./routes/counter'))
app.use("/api/inquiries",require('./routes/inquiry'))
app.use("/api/mission",require('./routes/mission'))
app.use("/api/vision",require('./routes/vision'))
app.use("/api/corevalue",require('./routes/corevalue'))
app.use("/api/aboutcompany",require('./routes/aboutcompany'))
app.use("/api/careeroption",require('./routes/careeroption'))
app.use("/api/careerInquiries",require('./routes/careerinquiry'))
app.use("/api/footer",require('./routes/footer'))
app.use("/api/header",require('./routes/header'))
app.use("/api/globalpresence",require('./routes/globalpresence'))
app.use("/api/whatsappsettings",require('./routes/whatsappsettings'))
app.use("/api/googlesettings",require('./routes/googlesettings'))
app.use("/api/menulisting",require('./routes/menulisting'))
app.use("/api/infrastructure",require('./routes/infrastructure'))
app.use("/api/qualitycontrol",require('./routes/qualitycontrol'))
app.use("/api/sitemap",require('./routes/sitemap'))
app.use("/api/benefits",require('./routes/benefits'))
app.use('/api/herosection',require('./routes/heroSection'))
app.use('/api/serviceDetails',require('./routes/serviceDetails'))
app.use("/api/homehero",require('./routes/HomeHero'))
app.use("/api/homepage",require('./routes/homepage'))
app.use("/api/video",require('./routes/video'))
app.use("/api/serviceImages",require('./routes/serviceImage'))
app.use("/api/industryImages",require('./routes/industryimage'))
app.use("/api/packages",require('./routes/plan'))
app.use("/api/designProcess",require('./routes/designProcess'))
app.use("/api/content",require('./routes/content'))
app.use("/api/submenulisting",require('./routes/submenu'))
app.use("/api/industries",require('./routes/industries'))
app.use("/api/industiesHeroSection",require('./routes/industriesHeroSection'))
app.use("/api/industiesDetails",require('./routes/industriesdetails'))
app.use('/api/portfolio',require('./routes/portfoliocategory'))
app.use('/api/navbar' , require('./routes/navbardata'))
app.use('/api/contactInfo' , require('./routes/contactInfo'))
app.use('/api/icon' , require('./routes/contactIcon'))
app.use('/api/address' , require('./routes/address'))
app.use("/api/contactinquiries",require('./routes/contactinquiry'))
app.use("/api/colors",require('./routes/managecolor'))
app.use("/api/newsletter",require('./routes/newsletter'))
app.use("/api/card",require('./routes/cards'))
app.use("/api/home",require('./routes/homeanimation'))
app.use("/api/popupinquiry",require('./routes/popupinquiry'))
app.use("/api/herosectioninquiry",require('./routes/herosectioninquiry'))
app.use("/api/logotype",require('./routes/logotype'))
app.use("/api/packagedescription",require('./routes/packagedescription'))

// Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerDocs = require('./swaggerConfig');


// app.use(cors({
// origin: 'http://localhost:3000',
// credentials: true,
// exposedHeaders: ['x-filename']
// }));

cron.schedule('59 23 31 * *', () => {
 
exportAndBackupAllCollectionsmonthly();
}, {
scheduled: true,
timezone: "Asia/Kolkata"
});



// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Static file serving
// app.use('/uploads', serveStatic(path.join(__dirname, 'uploads')));

// Mongoose connection options
const mongooseOptions = {
serverSelectionTimeoutMS: 5000,
socketTimeoutMS: 45000,
maxPoolSize: 10,
minPoolSize: 2,
maxIdleTimeMS: 30000,
family: 4,
retryWrites: true,
w: 'majority'
};

// Resource limits configuration
const RESOURCE_LIMITS = {
MAX_MEMORY_MB: 512, // 512MB max memory
MAX_HEAP_MB: 256, // 256MB max heap
IO_LIMIT_MB: 1, // 1MB/s IO limit
PROCESS_LIMIT: 20// Entry processes limit
};

// Add memory management configurations
const MEMORY_CONFIG = {
initialMemoryMB: 256,
maximumMemoryMB: 512,
wasmMemoryLimitMB: 256
};

// Add WebAssembly memory management
const configureWebAssembly = () => {
try {
// Configure WebAssembly memory limits with higher values
constwasmMemory = newWebAssembly.Memory({
initial: 16, // Minimum 16 pages (1MB per page = 16MB)
maximum: 256// Maximum 256 pages (256MB)
});

// Override WebAssembly instantiate
constoriginalInstantiate = WebAssembly.instantiate;
WebAssembly.instantiate = asyncfunction(...args) {
try {
// Add memory configuration to import object
if (args[1] && typeofargs[1] === 'object') {
args[1].env = {
...args[1].env,
memory: wasmMemory
};
}
returnawaitoriginalInstantiate.apply(this, args);
} catch (error) {
console.error('WebAssembly instantiation error:', error);
 
// Force garbage collection
if (global.gc) {
global.gc();
awaitnewPromise(resolve=>setTimeout(resolve, 1000));
}

// Retry with adjusted memory
try {
constadjustedMemory = newWebAssembly.Memory({
initial: 8, // Reduced to 8 pages (8MB)
maximum: 128// Reduced to 128 pages (128MB)
});
 
if (args[1] && typeofargs[1] === 'object') {
args[1].env = {
...args[1].env,
memory: adjustedMemory
};
}
returnawaitoriginalInstantiate.apply(this, args);
} catch (retryError) {
console.error('WebAssembly retry failed:', retryError);
// If retry fails, continue without WebAssembly optimization
returnoriginalInstantiate.apply(this, args);
}
}
};
} catch (error) {
console.error('Error configuring WebAssembly:', error);
// Continue without WebAssembly optimization
}
};

// Performance logger implementation
const performanceLogger = {
asynclogMetrics() {
constused = process.memoryUsage();
constmetrics = {
timestamp: newDate().toISOString(),
heapUsed: Math.round(used.heapUsed / 1024 / 1024),
heapTotal: Math.round(used.heapTotal / 1024 / 1024),
rss: Math.round(used.rss / 1024 / 1024),
external: Math.round(used.external / 1024 / 1024),
cpuUsage: process.cpuUsage()
};

try {
constlogDir = path.join(__dirname, 'logs');
awaitfs.mkdir(logDir, { recursive: true });
awaitfs.appendFile(
path.join(logDir, 'performance.log'),
JSON.stringify(metrics) + '\n'
);
} catch (error) {
console.error('Error logging metrics:', error);
}
}
};

// Resource monitoring function
const monitorResources = async () => {
constused = process.memoryUsage();
constheapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
constrssUsedMB = Math.round(used.rss / 1024 / 1024);
 
// Log memory usage
console.log(`Memory Usage - Heap: ${heapUsedMB}MB, RSS: ${rssUsedMB}MB`);
 
// Trigger garbage collection if memory usage is high
if (heapUsedMB > MEMORY_CONFIG.maximumMemoryMB * 0.8) {
if (global.gc) {
console.log('Triggering garbage collection...');
global.gc();
}
}
 
// Log metrics to file
awaitperformanceLogger.logMetrics();
 
// Check heap usage and trigger GC if needed
if (heapUsedMB > RESOURCE_LIMITS.MAX_HEAP_MB * 0.8) {
if (global.gc) {
global.gc();
console.log('Garbage collection triggered');
}
}
 
// Check total memory usage
if (rssUsedMB > RESOURCE_LIMITS.MAX_MEMORY_MB * 0.9) {
console.error('Critical memory usage. Initiating shutdown...');
process.emit('SIGTERM');
}
};

// Error recovery configuration
const MAX_RESTART_ATTEMPTS = 3;
let restartAttempts = 0;
let isShuttingDown = false;

// Global error handlers
process.on('uncaughtException', (error) => {
console.error('Uncaught Exception:', error);
monitorResources();
});

process.on('unhandledRejection', (reason, promise) => {
console.error('Unhandled Rejection at:', promise, 'reason:', reason);
monitorResources();
});

// Enhanced database connection with retry mechanism
const connectWithRetry = async (retries = 5) => {
try {
awaitmongoose.connect(process.env.DATABASE_URI, mongooseOptions);
console.log("Connected to MongoDB");
restartAttempts = 0;
} catch (error) {
console.error("MongoDB connection error:", error);
if (retries > 0) {
console.log(`Retrying connection... (${retries} attempts remaining)`);
awaitnewPromise(resolve=>setTimeout(resolve, 5000));
returnconnectWithRetry(retries - 1);
}
throwerror;
}
};

// Server initialization function
async function startServer() {
try {
// Configure WebAssembly before server start
configureWebAssembly();

// Set Node.js memory limits
constv8 = require('v8');
v8.setFlagsFromString('--max_old_space_size=' + MEMORY_CONFIG.maximumMemoryMB);

awaitconnectWithRetry();
 
constserver = http.createServer(app);
 
// Optimize server settings
server.keepAliveTimeout = 30000;
server.headersTimeout = 35000;
server.maxHeadersCount = 100;
 
// Handle server errors
server.on('error', (error) => {
console.error('Server error:', error);
if (!isShuttingDown) {
console.log('Attempting to recover from server error...');
setTimeout(() => {
if (restartAttempts < MAX_RESTART_ATTEMPTS) {
restartAttempts++;
startServer();
}
}, 5000);
}
});

// Start monitoring
constmonitoringInterval = setInterval(monitorResources, 5000);

// Enhanced graceful shutdown
constgracefulShutdown = async () => {
if (isShuttingDown) return;
isShuttingDown = true;

console.log("Starting graceful shutdown...");
clearInterval(monitoringInterval);

try {
awaitnewPromise((resolve) => {
server.close(resolve);
setTimeout(resolve, 10000);
});
console.log("HTTP server closed successfully");

if (mongoose.connection.readyState !== 0) {
await mongoose.connection.close();
console.log("Database connection closed successfully");
}

console.log("Graceful shutdown completed");
process.exit(0);
} catch (error) {
console.error("Error during shutdown:", error);
process.exit(1);
}
};

// Process termination handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
return server.listen(port, () => {
console.log(`Server is running on port ${port}`);
});

} catch (error) {
console.error("Server initialization error:", error);
if (restartAttempts < MAX_RESTART_ATTEMPTS) {
restartAttempts++;
console.log(`Attempting server restart... (Attempt ${restartAttempts}/${MAX_RESTART_ATTEMPTS})`);
awaitnewPromise(resolve=>setTimeout(resolve, 5000));
returnstartServer();
}
throwerror;
}
}

// Initialize the server with error handling
startServer().catch(error => {
console.error("Fatal error during server startup:", error);
});

// Add this before your routes
app.use((req, res, next) => {
console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
next();
});

// Update your navbar route registration
app.use('/api/navbar', (req, res, next) => {
console.log('Navbar route accessed');
require('./routes/navbardata')(req, res, next);
});

// Add this temporary route to check data
app.get('/api/debug/navbar', async (req, res) => {
try {
constdata = await NavbarModel.find({});
res.json({
count: data.length,
data: data
});
} catch (error) {
res.json({
error: error.message
});
}
});




// Enable garbage collection monitoring (requires --expose-gc flag)