const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');
// const applicationRoutes = require('./routes/applications'); // Not needed - loaded inline below



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:8001',
    'http://127.0.0.1:8001',
    'http://localhost:8003',
    'http://127.0.0.1:8003',
    ,
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ILOS Backend Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========================================
// DOCUMENT MANAGEMENT ENDPOINTS (Mobile App Support)
// ========================================

const DOCUMENTS_ROOT = process.env.DOCUMENTS_ROOT || path.join(__dirname, 'ilos_loan_application_documents');

// Configure multer for document uploads
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { losId, applicationType } = req.body;
    const uploadDir = path.join(DOCUMENTS_ROOT, applicationType.toLowerCase(), `los-${losId}`);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use original filename with timestamp to avoid overwrite
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${timestamp}${ext}`);
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images, PDFs, and common document types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed!'));
    }
  }
});

// Upload document endpoint for mobile app
app.post('/api/upload-document', documentUpload.single('document'), async (req, res) => {
  try {
    const { losId, applicationType, documentType } = req.body;
    const file = req.file;
    
    console.log('📤 Mobile document upload:', { losId, applicationType, documentType, file: file?.filename });
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    if (!losId || !applicationType) {
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'losId and applicationType are required' });
    }
    
    console.log(`✅ Document uploaded successfully: ${file.filename} for LOS-${losId}`);
    
    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        name: file.filename,
        originalName: file.originalname,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        path: `/explorer/${applicationType.toLowerCase()}/los-${losId}/${encodeURIComponent(file.filename)}`,
      }
    });
    
  } catch (error) {
    console.error('❌ Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document', details: error.message });
  }
});

// Get list of documents for an application
app.get('/api/documents/:losId', async (req, res) => {
  try {
    const { losId } = req.params;
    const { applicationType } = req.query; // Optional query parameter
    
    console.log('📄 Fetching documents for LOS-' + losId + (applicationType ? ` (${applicationType})` : ''));
    console.log('📁 DOCUMENTS_ROOT:', DOCUMENTS_ROOT);
    
    let documents = [];
    
    // If applicationType is provided, use it directly
    if (applicationType) {
      const normalizedType = applicationType.toLowerCase();
      const docDir = path.join(DOCUMENTS_ROOT, normalizedType, `los-${losId}`);
      
      console.log('📂 Looking for documents in:', docDir);
      console.log('📂 Directory exists:', fs.existsSync(docDir));
      
      if (fs.existsSync(docDir)) {
        const files = fs.readdirSync(docDir);
        console.log('📄 Found files:', files);
        
        documents = files.map(file => {
          const filePath = path.join(docDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            name: file,
            size: stats.size,
            uploadedAt: stats.mtime,
            path: `/explorer/${normalizedType}/los-${losId}/${encodeURIComponent(file)}`,
          };
        });
      } else {
        console.log('📂 Directory not found, will return empty array');
      }
    } else {
      // If no applicationType, scan all common types
      const commonTypes = ['cashplus', 'autoloan', 'homeloan', 'ameendrive', 'personalloan'];
      
      for (const type of commonTypes) {
        const docDir = path.join(DOCUMENTS_ROOT, type, `los-${losId}`);
        
        if (fs.existsSync(docDir)) {
          const files = fs.readdirSync(docDir);
          const typeDocs = files.map(file => {
            const filePath = path.join(docDir, file);
            const stats = fs.statSync(filePath);
            
            return {
              name: file,
              size: stats.size,
              uploadedAt: stats.mtime,
              path: `/explorer/${type}/los-${losId}/${encodeURIComponent(file)}`,
            };
          });
          documents.push(...typeDocs);
        }
      }
    }
    
    console.log(`✅ Found ${documents.length} documents for LOS-${losId}`);
    res.json({ documents });
    
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch documents', details: error.message });
  }
});

// Serve documents via explorer endpoint (for viewing/downloading)
app.get('/explorer/:applicationType/:losId/:fileName', async (req, res) => {
  try {
    const { applicationType, losId, fileName } = req.params;
    
    // Sanitize inputs to prevent directory traversal
    const sanitizedType = path.basename(applicationType);
    const sanitizedLosId = path.basename(losId);
    const sanitizedFileName = path.basename(decodeURIComponent(fileName));
    
    const filePath = path.join(DOCUMENTS_ROOT, sanitizedType, sanitizedLosId, sanitizedFileName);
    
    console.log(`📄 Serving document: ${sanitizedFileName} for ${losId}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Document not found: ${filePath}`);
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Set appropriate content type
    const ext = path.extname(sanitizedFileName).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.htm': 'text/html',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    
    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${sanitizedFileName}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
      console.error('❌ Error streaming file:', error);
      res.status(500).json({ error: 'Failed to stream file' });
    });
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('❌ Error serving document:', error);
    res.status(500).json({ error: 'Failed to serve document', details: error.message });
  }
});

// Customer Status Endpoint
app.get('/customer-status/:cnic', async (req, res) => {
  try {
    const { cnic } = req.params;
    const customerService = require('./customerService');
    const customerStatus = await customerService.getCustomerStatus(cnic);
    res.json(customerStatus);
  } catch (error) {
    console.error('Error fetching customer status:', error);
    res.status(500).json({ error: 'Failed to fetch customer status' });
  }
});

// NTB/ETB Endpoint
app.get('/api/getNTB_ETB/:cnic', async (req, res) => {
  try {
    const { cnic } = req.params;

    if (!cnic || cnic.length !== 13) {
      return res.status(400).json({ error: 'Valid 13-digit CNIC is required' });
    }

    const query = `
      SELECT 
        customer_id, cnic, status, fullname, domicile_country, domicile_state,
        city, district, business, industry, created_at
      FROM cif_customers
      WHERE cnic = $1
    `;

    const result = await db.query(query, [cnic]);

    if (result.rows.length === 0) {
      return res.json({
        isETB: false,
        customer: null,
        message: 'New customer'
      });
    }

    const customer = result.rows[0];

    const formattedCustomer = {
      customerId: customer.customer_id,
      cnic: customer.cnic,
      status: customer.status,
      fullname: customer.fullname,
      firstName: customer.fullname?.split(' ')[0] || '',
      lastName: customer.fullname?.split(' ').slice(-1)[0] || '',
      domicileCountry: customer.domicile_country,
      domicileState: customer.domicile_state,
      city: customer.city,
      district: customer.district,
      business: customer.business,
      industry: customer.industry,
      createdAt: customer.created_at
    };

    res.json({
      isETB: true,
      customer: formattedCustomer,
      message: 'Existing customer found'
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test route to verify server works
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server test route works!', timestamp: new Date().toISOString() });
});

// Routes - using minimal version for testing
app.use('/api/applications', require('./routes/applications'));
// Lightweight endpoints including /api/agents
app.use('/api', require('./routes/applications-minimal'));
// Customer mobile app routes
app.use('/api/customer', require('./routes/customer'));
// CBS customer creation (NTB → ETB conversion)
app.use('/api/cbs-customer', require('./routes/cbsCustomer'));
// PB routes for handling mobile app submissions
app.use('/api/pb', require('./routes/pb'));
console.log('✅ PB routes registered (mobile→PB flow)');
app.use('/api/personal-details', require('./routes/personalDetails'));
app.use('/api/current-address', require('./routes/currentAddress'));
app.use('/api/permanent-address', require('./routes/permanentAddress'));
app.use('/api/employment-details', require('./routes/employmentDetails'));
app.use('/api/vehicle-details', require('./routes/vehicleDetails'));
app.use('/api/reference-contacts', require('./routes/referenceContacts'));
app.use('/api/insurance-details', require('./routes/insuranceDetails'));
app.use('/api/contact-details', require('./routes/contactDetails'));
app.use('/api/verification', require('./routes/verification'));
app.use('/api/spu-officer', require('./routes/spuOfficer'));
app.use('/api/spu', require('./routes/spu'));
app.use('/api/cif', require('./routes/cif'));
app.use('/cif', require('./routes/cif'));
app.use('/api/cashplus', require('./routes/cashplus'));
app.use('/api/autoloan', require('./routes/autoloan'));
app.use('/api/ameendrive', require('./routes/ameendrive'));
app.use('/api/smeasaan', require('./routes/smeasaan'));
app.use('/api/commercialVehicle', require('./routes/commercialVehicle'));
app.use('/api/classic_creditcard', require('./routes/classic_creditcard'));
app.use('/api/platinum_creditcard', require('./routes/platinum_creditcard'));
app.use('/api/instantloan', require('./routes/instantloan')); // ETB customers only, auto-approved
// Removed duplicate applications route - already mounted above

//EXTERNAL APIs

app.use('/api/sbp-blacklist',       require('./routes/sbp_blacklist'));
app.use('/api/pep',                 require('./routes/pep'));
app.use('/api/internal-watchlist',  require('./routes/internal_watchlist'));
app.use('/api/nadra-verisys',       require('./routes/nadra_verisys'));
app.use('/api/frms',                require('./routes/frms'));
app.use('/api/consumer-companies',  require('./routes/consumer_companies_list'));
app.use('/api/ecib-reports',        require('./routes/ecib_reports'));
// Keep only one combined checks router, prefer canonical file casing
app.use('/api',                     require('./routes/combineChecks'));
app.use('/api/ccl',        require('./routes/consumer_companies_list'));

// Department Change Tracking Routes
app.use('/api/department-changes', require('./routes/department-changes'));

// Decision Engine Routes
app.use('/api/decision-engine', require('./routes/decision-engine'));

// 🤖 Automation System Routes
console.log('🤖 Initializing Automation System...');
app.use('/api/automation-stats', require('./routes/automation-stats'));
console.log('✅ Automation routes registered');

// Initialize Queue Processor
try {
  const queueProcessor = require('./services/queueProcessor');
  console.log('✅ Queue processor initialized');
} catch (error) {
  console.error('⚠️ Queue processor initialization failed:', error.message);
}

// Database Change Detection Integration
console.log('🔍 Initializing Database Change Detection...');
const DatabaseChangeProcessor = require('./lib/DatabaseChangeProcessor');
const dbChangeProcessor = new DatabaseChangeProcessor();

// Start periodic processing of database changes (every 30 seconds)
dbChangeProcessor.startPeriodicProcessing(120000);

// Database Change Detection API Routes
app.get('/api/database-changes/health', async (req, res) => {
  try {
    const health = await dbChangeProcessor.getHealthStatus();
    res.json({ success: true, health });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route for all changes (no LOS ID)
app.get('/api/database-changes/summary', async (req, res) => {
  try {
    const { limit } = req.query;
    const changes = await dbChangeProcessor.getDatabaseChangesSummary(null, parseInt(limit) || 50);
    res.json({ 
      success: true, 
      losId: 'ALL',
      totalChanges: changes.length,
      changes 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route for specific LOS ID
app.get('/api/database-changes/summary/:losId', async (req, res) => {
  try {
    const { losId } = req.params;
    const { limit } = req.query;
    const changes = await dbChangeProcessor.getDatabaseChangesSummary(losId, parseInt(limit) || 50);
    res.json({ 
      success: true, 
      losId: losId || 'ALL',
      totalChanges: changes.length,
      changes 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/database-changes/detailed/:losId', async (req, res) => {
  try {
    const { losId } = req.params;
    const analysis = await dbChangeProcessor.getDetailedChangesForLos(losId);
    res.json({ 
      success: true, 
      losId,
      analysis 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/database-changes/process', async (req, res) => {
  try {
    const result = await dbChangeProcessor.forceProcessAllUnprocessed();
    res.json({ 
      success: true, 
      message: 'Processing completed',
      result 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// EAMVU Agents Routes
const agentsRouter = require('./routes/agents');
app.use('/api/agents', agentsRouter);

// Decision Engine Routes
const decisionEngineRouter = require('./routes/decision-engine');
app.use('/api/decision', decisionEngineRouter);

// Configure multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Document Upload Endpoint
app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    const { documentType, losId, loan_type, fileName } = req.body;
    
    console.log('📤 File uploaded:', {
      originalName: req.file.originalname,
      savedAs: req.file.filename,
      size: req.file.size,
      documentType,
      losId,
      loan_type
    });

    // Optionally save to database
    if (losId && documentType) {
      try {
        await db.query(`
          INSERT INTO application_documents (los_id, document_type, file_name, file_path, file_size, uploaded_at)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        `, [
          parseInt(losId),
          documentType,
          fileName || req.file.originalname,
          req.file.filename,
          req.file.size
        ]);
        console.log('✅ Document saved to database');
      } catch (dbError) {
        console.warn('⚠️ Could not save to database:', dbError.message);
        // Continue even if DB save fails
      }
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        originalName: req.file.originalname,
        savedName: req.file.filename,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Upload failed' 
    });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server and bind to all interfaces (0.0.0.0) to allow Android emulator access
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Server running at: http://localhost:${PORT}`);
  console.log(`📱 Mobile app can connect at: http://10.0.2.2:${PORT} (Android emulator)`);
  console.log(`🌐 API endpoints available at: http://localhost:${PORT}/api`);
  console.log(`✅ Server is accessible from all network interfaces (including Android emulator)`);
});
