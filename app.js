const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// SQLite database setup
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    // Create Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT
        )
    `);
    // Create Tasks table
    db.run(`
        CREATE TABLE IF NOT EXISTS Tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            status TEXT,
            assignee_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(assignee_id) REFERENCES Users(id)
        )
    `);

    // Insert dummy users
    db.run(`
        INSERT INTO Users (username, password_hash) VALUES
        ('john_doe', 'password1'),
        ('jane_smith', 'password2'),
        ('alex_brown', 'password3')
    `);

    // Insert dummy tasks
    db.run(`
        INSERT INTO Tasks (title, description, status, assignee_id) VALUES
        ('Task 1', 'Description for Task 1', 'pending', 1),
        ('Task 2', 'Description for Task 2', 'in progress', 2),
        ('Task 3', 'Description for Task 3', 'completed', 3)
    `);
});

// Middleware
app.use(bodyParser.json());

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token,TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Route handler for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the Task Management API');
});

// Routes for user registration, login, tasks, etc. (existing code)

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
