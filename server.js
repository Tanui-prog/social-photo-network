const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 8080;

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync('public/uploads', { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

// Initialize SQLite database
const db = new sqlite3.Database('photos.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        // Create photos table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            caption TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/photos', (req, res) => {
    db.all('SELECT * FROM photos ORDER BY timestamp DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch photos' });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/photos', upload.single('photo'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    const photoUrl = '/uploads/' + req.file.filename;
    const caption = req.body.caption || '';

    db.run('INSERT INTO photos (url, caption) VALUES (?, ?)',
        [photoUrl, caption],
        function(err) {
            if (err) {
                res.status(500).json({ error: 'Failed to save photo to database' });
                return;
            }
            res.json({ 
                success: true, 
                id: this.lastID,
                url: photoUrl,
                caption: caption
            });
        }
    );
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
