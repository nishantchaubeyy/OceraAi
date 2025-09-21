// To run this file, you first need to install Node.js.
// Then, open your terminal in the same folder as this file and run:
// 1. npm install
// 2. npm start
// Your server will then be running at http://localhost:3000

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');
// node-fetch is needed for making API calls in some Node.js versions
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const port = process.env.PORT || 3000;

// --- Database Setup ---
const db = new sqlite3.Database('./marine_species.db');

// Initialize database tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS species_identifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        common_name TEXT,
        scientific_name TEXT,
        description TEXT,
        confidence_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT,
        response TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Data ingestion portal tables
    db.run(`CREATE TABLE IF NOT EXISTS datasets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        filename TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        source TEXT NOT NULL,
        format TEXT NOT NULL,
        file_size INTEGER,
        records_count INTEGER DEFAULT 0,
        processing_status TEXT DEFAULT 'uploaded',
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_date DATETIME,
        description TEXT,
        metadata TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS dataset_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dataset_id INTEGER,
        species_name TEXT,
        scientific_name TEXT,
        habitat TEXT,
        depth_range TEXT,
        temperature_range TEXT,
        distribution TEXT,
        conservation_status TEXT,
        diet TEXT,
        size TEXT,
        weight TEXT,
        characteristics TEXT,
        threats TEXT,
        latitude REAL,
        longitude REAL,
        observation_date DATE,
        raw_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS processing_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dataset_id INTEGER,
        log_level TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
    )`);
});

// --- File Upload Setup ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Data ingestion file upload configuration
const dataStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './data_uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const dataUpload = multer({
    storage: dataStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for datasets
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['text/csv', 'application/json', 'text/plain'];
        if (allowedTypes.includes(file.mimetype) || 
            file.originalname.toLowerCase().endsWith('.csv') ||
            file.originalname.toLowerCase().endsWith('.json')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV and JSON files are allowed!'), false);
        }
    }
});

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use('/data_uploads', express.static('data_uploads'));

// --- Data Validation and Parsing Functions ---

// Validate and normalize species data
function normalizeSpeciesData(record, source) {
    const normalized = {
        species_name: record.species_name || record.common_name || record.name || null,
        scientific_name: record.scientific_name || record.scientificName || record.binomial || null,
        habitat: record.habitat || record.environment || null,
        depth_range: record.depth_range || record.depth || record.min_depth && record.max_depth ? `${record.min_depth}-${record.max_depth}m` : null,
        temperature_range: record.temperature_range || record.temperature || record.min_temp && record.max_temp ? `${record.min_temp}-${record.max_temp}°C` : null,
        distribution: record.distribution || record.range || record.location || null,
        conservation_status: record.conservation_status || record.status || record.iucn_status || null,
        diet: record.diet || record.food || record.feeding || null,
        size: record.size || record.length || record.body_size || null,
        weight: record.weight || record.mass || null,
        characteristics: Array.isArray(record.characteristics) ? record.characteristics.join('; ') : record.characteristics || record.description || null,
        threats: Array.isArray(record.threats) ? record.threats.join('; ') : record.threats || record.threat || null,
        latitude: parseFloat(record.latitude || record.lat || record.decimalLatitude) || null,
        longitude: parseFloat(record.longitude || record.lng || record.lon || record.decimalLongitude) || null,
        observation_date: record.observation_date || record.date || record.eventDate || null,
        raw_data: JSON.stringify(record)
    };
    
    return normalized;
}

// Parse CSV data
function parseCSVData(filePath) {
    return new Promise((resolve, reject) => {
        const records = [];
        const errors = [];
        
        fs.createReadStream(filePath)
            .pipe(parse({ 
                columns: true, 
                skip_empty_lines: true,
                trim: true,
                relax_quotes: true
            }))
            .on('data', (data) => {
                try {
                    records.push(data);
                } catch (error) {
                    errors.push({ row: records.length + 1, error: error.message });
                }
            })
            .on('error', (error) => {
                reject(error);
            })
            .on('end', () => {
                resolve({ records, errors });
            });
    });
}

// Parse JSON data
function parseJSONData(filePath) {
    return new Promise((resolve, reject) => {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(fileContent);
            
            let records = [];
            if (Array.isArray(data)) {
                records = data;
            } else if (data.records || data.data) {
                records = data.records || data.data;
            } else if (data.results) {
                records = data.results;
            } else {
                records = [data];
            }
            
            resolve({ records, errors: [] });
        } catch (error) {
            reject(error);
        }
    });
}

// Process and validate dataset
async function processDataset(datasetId, filePath, source, format) {
    try {
        let parseResult;
        
        if (format === 'csv') {
            parseResult = await parseCSVData(filePath);
        } else if (format === 'json') {
            parseResult = await parseJSONData(filePath);
        } else {
            throw new Error('Unsupported format');
        }
        
        const { records, errors } = parseResult;
        
        // Log parsing errors
        for (const error of errors) {
            await logProcessingMessage(datasetId, 'warning', `Row ${error.row}: ${error.error}`);
        }
        
        // Process and store records
        const processedCount = await storeDatasetRecords(datasetId, records, source);
        
        // Update dataset status
        await updateDatasetStatus(datasetId, 'processed', processedCount);
        
        await logProcessingMessage(datasetId, 'info', `Successfully processed ${processedCount} records`);
        
        return { success: true, recordsProcessed: processedCount, errors: errors };
        
    } catch (error) {
        await logProcessingMessage(datasetId, 'error', error.message);
        await updateDatasetStatus(datasetId, 'failed', 0);
        throw error;
    }
}

// Store dataset records in database
function storeDatasetRecords(datasetId, records, source) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`INSERT INTO dataset_records (
            dataset_id, species_name, scientific_name, habitat, depth_range, 
            temperature_range, distribution, conservation_status, diet, size, weight, 
            characteristics, threats, latitude, longitude, observation_date, raw_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        
        let processedCount = 0;
        
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            for (const record of records) {
                const normalized = normalizeSpeciesData(record, source);
                
                stmt.run([
                    datasetId,
                    normalized.species_name,
                    normalized.scientific_name,
                    normalized.habitat,
                    normalized.depth_range,
                    normalized.temperature_range,
                    normalized.distribution,
                    normalized.conservation_status,
                    normalized.diet,
                    normalized.size,
                    normalized.weight,
                    normalized.characteristics,
                    normalized.threats,
                    normalized.latitude,
                    normalized.longitude,
                    normalized.observation_date,
                    normalized.raw_data
                ]);
                
                processedCount++;
            }
            
            db.run('COMMIT', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(processedCount);
                }
            });
        });
    });
}

// Update dataset processing status
function updateDatasetStatus(datasetId, status, recordsCount) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`UPDATE datasets SET 
            processing_status = ?, 
            records_count = ?, 
            processed_date = CURRENT_TIMESTAMP 
            WHERE id = ?`);
        
        stmt.run([status, recordsCount, datasetId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

// Log processing messages
function logProcessingMessage(datasetId, level, message) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`INSERT INTO processing_logs (dataset_id, log_level, message) VALUES (?, ?, ?)`);
        
        stmt.run([datasetId, level, message], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

// --- Environment Variables ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY environment variable is not set!');
    process.exit(1);
}
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;


// --- API Endpoints ---

// File Upload Endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file uploaded." });
        }

        console.log(`File uploaded: ${req.file.filename}`);
        
        // Convert uploaded file to base64 for Gemini API
        const imagePath = req.file.path;
        const imageBuffer = fs.readFileSync(imagePath);
        const imageBase64 = imageBuffer.toString('base64');
        
        // Analyze the uploaded image
        const analysisResult = await analyzeImageWithGemini(imageBase64, req.file.mimetype);
        
        // Save to database
        const stmt = db.prepare(`INSERT INTO species_identifications 
            (filename, common_name, scientific_name, description, confidence_score) 
            VALUES (?, ?, ?, ?, ?)`);
        
        stmt.run([
            req.file.filename,
            analysisResult.commonName || 'Unknown',
            analysisResult.scientificName || 'Unknown',
            analysisResult.description || 'No description available',
            analysisResult.confidence || 0.5
        ]);
        
        res.status(200).json({
            message: "File uploaded and analyzed successfully",
            filename: req.file.filename,
            analysis: analysisResult,
            fileUrl: `/uploads/${req.file.filename}`
        });

    } catch (error) {
        console.error("Error in file upload:", error);
        res.status(500).json({ error: "Failed to upload and analyze file." });
    }
});


// Helper function for Gemini API analysis
async function analyzeImageWithGemini(imageBase64, mimeType) {
    const payload = {
        contents: [{
            parts: [
                { text: `Identify the marine species in this image. Please provide your response in the following JSON format:
                {
                    "commonName": "Common name of the species",
                    "scientificName": "Scientific name",
                    "description": "Brief description of the species",
                    "confidence": 0.85,
                    "habitat": "Where it's typically found",
                    "characteristics": ["key feature 1", "key feature 2"]
                }` },
                { inlineData: { mimeType: mimeType, data: imageBase64 } }
            ]
        }],
    };

    const geminiResponse = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if (!geminiResponse.ok) {
        throw new Error(`Gemini API failed with status ${geminiResponse.status}`);
    }

    const result = await geminiResponse.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    try {
        // Try to parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.log("Failed to parse JSON, using text response");
    }
    
    // Fallback to text response
    return {
        commonName: "Unknown",
        scientificName: "Unknown",
        description: text,
        confidence: 0.5
    };
}

// Endpoint for Image Analysis (Base64)
app.post('/api/analyze-image', async (req, res) => {
    try {
        console.log("Received image analysis request.");
        const { imageBase64, mimeType } = req.body;

        if (!imageBase64 || !mimeType) {
            return res.status(400).json({ error: "Missing image data or mimeType." });
        }

        const analysisResult = await analyzeImageWithGemini(imageBase64, mimeType);
        res.status(200).json({ analysis: analysisResult });

    } catch (error) {
        console.error("Error in image analysis:", error);
        res.status(500).json({ error: "Failed to analyze image on the server." });
    }
});


// Endpoint for the AI Chatbot
app.post('/api/chat', async (req, res) => {
    try {
        console.log("Received chat message request.");
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: "Message cannot be empty." });
        }

        if (message.length > 1000) {
            return res.status(400).json({ error: "Message too long. Please keep it under 1000 characters." });
        }
        
        const payload = {
            contents: [{ parts: [{ text: message }] }],
            systemInstruction: {
                parts: [{ text: "You are Aqua, a knowledgeable marine biology AI assistant. You help users identify marine species, provide information about ocean life, marine ecosystems, conservation, and answer questions about marine biology. Keep responses informative but concise." }]
            },
        };

        const geminiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            throw new Error(`Gemini API failed with status ${geminiResponse.status}: ${errorText}`);
        }

        const result = await geminiResponse.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("No response text received from Gemini API");
        }

        // Save chat to database
        const stmt = db.prepare(`INSERT INTO chat_history (message, response) VALUES (?, ?)`);
        stmt.run([message, text]);

        res.status(200).json({ reply: text });

    } catch (error) {
        console.error("Error in chat:", error);
        res.status(500).json({ error: "Failed to get chat response from the server." });
    }
});

// Get recent identifications
app.get('/api/recent-identifications', (req, res) => {
    try {
        db.all(`SELECT * FROM species_identifications ORDER BY created_at DESC LIMIT 10`, (err, rows) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to fetch recent identifications." });
            }
            res.json(rows);
        });
    } catch (error) {
        console.error("Error fetching recent identifications:", error);
        res.status(500).json({ error: "Failed to fetch recent identifications." });
    }
});

// Get chat history
app.get('/api/chat-history', (req, res) => {
    try {
        db.all(`SELECT * FROM chat_history ORDER BY created_at DESC LIMIT 20`, (err, rows) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to fetch chat history." });
            }
            res.json(rows);
        });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ error: "Failed to fetch chat history." });
    }
});

// --- Data Ingestion API Endpoints ---

// Upload dataset file
app.post('/api/datasets/upload', dataUpload.single('dataset'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No dataset file uploaded." });
        }
        
        const { name, source, description } = req.body;
        
        if (!name || !source) {
            return res.status(400).json({ error: "Dataset name and source are required." });
        }
        
        if (!['NOAA', 'OBIS', 'Custom'].includes(source)) {
            return res.status(400).json({ error: "Source must be NOAA, OBIS, or Custom." });
        }
        
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        const format = fileExtension === '.csv' ? 'csv' : fileExtension === '.json' ? 'json' : 'unknown';
        
        if (format === 'unknown') {
            return res.status(400).json({ error: "Unsupported file format. Only CSV and JSON files are allowed." });
        }
        
        console.log(`Dataset file uploaded: ${req.file.filename}`);
        
        // Save dataset metadata to database
        const stmt = db.prepare(`INSERT INTO datasets (
            name, filename, original_filename, source, format, file_size, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`);
        
        stmt.run([
            name,
            req.file.filename,
            req.file.originalname,
            source,
            format,
            req.file.size,
            description || null
        ], async function(err) {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to save dataset metadata." });
            }
            
            const datasetId = this.lastID;
            
            // Process dataset asynchronously
            setTimeout(async () => {
                try {
                    await processDataset(datasetId, req.file.path, source, format);
                } catch (error) {
                    console.error(`Error processing dataset ${datasetId}:`, error);
                }
            }, 100);
            
            res.status(200).json({
                message: "Dataset uploaded successfully and processing started",
                datasetId: datasetId,
                filename: req.file.filename,
                originalFilename: req.file.originalname,
                format: format,
                size: req.file.size
            });
        });
        
    } catch (error) {
        console.error("Error in dataset upload:", error);
        res.status(500).json({ error: "Failed to upload dataset." });
    }
});

// Get all datasets
app.get('/api/datasets', (req, res) => {
    try {
        const { source, status, limit = 50, offset = 0 } = req.query;
        
        let query = `SELECT * FROM datasets WHERE 1=1`;
        const params = [];
        
        if (source) {
            query += ` AND source = ?`;
            params.push(source);
        }
        
        if (status) {
            query += ` AND processing_status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY upload_date DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to fetch datasets." });
            }
            res.json(rows);
        });
    } catch (error) {
        console.error("Error fetching datasets:", error);
        res.status(500).json({ error: "Failed to fetch datasets." });
    }
});

// Get dataset by ID with records
app.get('/api/datasets/:id', (req, res) => {
    try {
        const datasetId = parseInt(req.params.id);
        
        db.get(`SELECT * FROM datasets WHERE id = ?`, [datasetId], (err, dataset) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to fetch dataset." });
            }
            
            if (!dataset) {
                return res.status(404).json({ error: "Dataset not found." });
            }
            
            // Get first 100 records as preview
            db.all(`SELECT * FROM dataset_records WHERE dataset_id = ? LIMIT 100`, 
                [datasetId], (err, records) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "Failed to fetch dataset records." });
                }
                
                res.json({ dataset, records });
            });
        });
    } catch (error) {
        console.error("Error fetching dataset:", error);
        res.status(500).json({ error: "Failed to fetch dataset." });
    }
});

// Get dataset records with pagination
app.get('/api/datasets/:id/records', (req, res) => {
    try {
        const datasetId = parseInt(req.params.id);
        const { limit = 50, offset = 0, search } = req.query;
        
        let query = `SELECT * FROM dataset_records WHERE dataset_id = ?`;
        const params = [datasetId];
        
        if (search) {
            query += ` AND (species_name LIKE ? OR scientific_name LIKE ? OR habitat LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        query += ` ORDER BY id LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        db.all(query, params, (err, records) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to fetch dataset records." });
            }
            
            // Get total count
            let countQuery = `SELECT COUNT(*) as total FROM dataset_records WHERE dataset_id = ?`;
            const countParams = [datasetId];
            
            if (search) {
                countQuery += ` AND (species_name LIKE ? OR scientific_name LIKE ? OR habitat LIKE ?)`;
                const searchTerm = `%${search}%`;
                countParams.push(searchTerm, searchTerm, searchTerm);
            }
            
            db.get(countQuery, countParams, (err, countResult) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "Failed to fetch record count." });
                }
                
                res.json({
                    records,
                    total: countResult.total,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                });
            });
        });
    } catch (error) {
        console.error("Error fetching dataset records:", error);
        res.status(500).json({ error: "Failed to fetch dataset records." });
    }
});

// Get processing logs for a dataset
app.get('/api/datasets/:id/logs', (req, res) => {
    try {
        const datasetId = parseInt(req.params.id);
        
        db.all(`SELECT * FROM processing_logs WHERE dataset_id = ? ORDER BY created_at DESC`, 
            [datasetId], (err, logs) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to fetch processing logs." });
            }
            res.json(logs);
        });
    } catch (error) {
        console.error("Error fetching processing logs:", error);
        res.status(500).json({ error: "Failed to fetch processing logs." });
    }
});

// Delete dataset
app.delete('/api/datasets/:id', (req, res) => {
    try {
        const datasetId = parseInt(req.params.id);
        
        // Get dataset info to delete file
        db.get(`SELECT filename FROM datasets WHERE id = ?`, [datasetId], (err, dataset) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to fetch dataset for deletion." });
            }
            
            if (!dataset) {
                return res.status(404).json({ error: "Dataset not found." });
            }
            
            // Delete from database (cascade will handle related records)
            db.run(`DELETE FROM datasets WHERE id = ?`, [datasetId], function(err) {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "Failed to delete dataset from database." });
                }
                
                // Delete file from filesystem
                const filePath = path.join('./data_uploads', dataset.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                
                res.json({ message: "Dataset deleted successfully" });
            });
        });
    } catch (error) {
        console.error("Error deleting dataset:", error);
        res.status(500).json({ error: "Failed to delete dataset." });
    }
});

// Export dataset as CSV
app.get('/api/datasets/:id/export', (req, res) => {
    try {
        const datasetId = parseInt(req.params.id);
        const { format = 'csv' } = req.query;
        
        // Get dataset info
        db.get(`SELECT * FROM datasets WHERE id = ?`, [datasetId], (err, dataset) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to fetch dataset." });
            }
            
            if (!dataset) {
                return res.status(404).json({ error: "Dataset not found." });
            }
            
            // Get all records
            db.all(`SELECT * FROM dataset_records WHERE dataset_id = ? ORDER BY id`, [datasetId], (err, records) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "Failed to fetch dataset records." });
                }
                
                if (format === 'json') {
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Content-Disposition', `attachment; filename="${dataset.name}-export.json"`);
                    res.json({ dataset, records });
                } else {
                    // Export as CSV
                    const csvColumns = [
                        'species_name', 'scientific_name', 'habitat', 'depth_range', 'temperature_range',
                        'distribution', 'conservation_status', 'diet', 'size', 'weight', 'characteristics',
                        'threats', 'latitude', 'longitude', 'observation_date'
                    ];
                    
                    stringify(records, { header: true, columns: csvColumns }, (err, csvData) => {
                        if (err) {
                            console.error("CSV generation error:", err);
                            return res.status(500).json({ error: "Failed to generate CSV export." });
                        }
                        
                        res.setHeader('Content-Type', 'text/csv');
                        res.setHeader('Content-Disposition', `attachment; filename="${dataset.name}-export.csv"`);
                        res.send(csvData);
                    });
                }
            });
        });
    } catch (error) {
        console.error("Error exporting dataset:", error);
        res.status(500).json({ error: "Failed to export dataset." });
    }
});

// Get dataset statistics
app.get('/api/datasets/statistics', (req, res) => {
    try {
        const queries = [
            'SELECT COUNT(*) as total_datasets FROM datasets',
            'SELECT COUNT(*) as total_records FROM dataset_records',
            'SELECT source, COUNT(*) as count FROM datasets GROUP BY source',
            'SELECT processing_status, COUNT(*) as count FROM datasets GROUP BY processing_status',
            'SELECT COUNT(DISTINCT species_name) as unique_species FROM dataset_records WHERE species_name IS NOT NULL',
            'SELECT COUNT(DISTINCT scientific_name) as unique_scientific_names FROM dataset_records WHERE scientific_name IS NOT NULL'
        ];
        
        Promise.all(queries.map(query => new Promise((resolve, reject) => {
            db.all(query, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        }))).then(results => {
            const [totalDatasets, totalRecords, bySource, byStatus, uniqueSpecies, uniqueScientificNames] = results;
            
            res.json({
                totalDatasets: totalDatasets[0].total_datasets,
                totalRecords: totalRecords[0].total_records,
                uniqueSpecies: uniqueSpecies[0].unique_species,
                uniqueScientificNames: uniqueScientificNames[0].unique_scientific_names,
                bySource: bySource,
                byStatus: byStatus
            });
        }).catch(error => {
            console.error("Statistics query error:", error);
            res.status(500).json({ error: "Failed to fetch statistics." });
        });
    } catch (error) {
        console.error("Error fetching statistics:", error);
        res.status(500).json({ error: "Failed to fetch statistics." });
    }
});

// Search across all datasets
app.get('/api/search', (req, res) => {
    try {
        const { q, source, limit = 50, offset = 0 } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ error: "Search query must be at least 2 characters long." });
        }
        
        let query = `
            SELECT dr.*, d.name as dataset_name, d.source as dataset_source 
            FROM dataset_records dr 
            JOIN datasets d ON dr.dataset_id = d.id 
            WHERE (dr.species_name LIKE ? OR dr.scientific_name LIKE ? OR dr.habitat LIKE ? OR dr.distribution LIKE ?)
        `;
        
        const searchTerm = `%${q.trim()}%`;
        const params = [searchTerm, searchTerm, searchTerm, searchTerm];
        
        if (source) {
            query += ` AND d.source = ?`;
            params.push(source);
        }
        
        query += ` ORDER BY dr.species_name LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        db.all(query, params, (err, records) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to search datasets." });
            }
            
            // Get total count
            let countQuery = `
                SELECT COUNT(*) as total 
                FROM dataset_records dr 
                JOIN datasets d ON dr.dataset_id = d.id 
                WHERE (dr.species_name LIKE ? OR dr.scientific_name LIKE ? OR dr.habitat LIKE ? OR dr.distribution LIKE ?)
            `;
            
            const countParams = [searchTerm, searchTerm, searchTerm, searchTerm];
            
            if (source) {
                countQuery += ` AND d.source = ?`;
                countParams.push(source);
            }
            
            db.get(countQuery, countParams, (err, countResult) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "Failed to get search count." });
                }
                
                res.json({
                    records,
                    total: countResult.total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    query: q
                });
            });
        });
    } catch (error) {
        console.error("Error searching datasets:", error);
        res.status(500).json({ error: "Failed to search datasets." });
    }
});


// --- Start the server ---
app.listen(port, () => {
    console.log(`Backend server is running successfully at http://localhost:${port}`);
    console.log('Waiting for requests from the frontend...');
});

