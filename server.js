const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 2121;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // ✅ Corrected static path

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// Mongoose Schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    mobile: String,
    password: String
});
const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // ✅ Correct path
});

// Register Route
app.post('/register', async (req, res) => {
    const { username, email, mobile, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.send("❌ User already exists!");

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, mobile, password: hashedPassword });

        await newUser.save();
        res.send("✅ Registration successful!");
    } catch (err) {
        console.error(err);
        res.status(500).send("⚠ Server error during registration.");
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.send("❌ User not found!");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.send("❌ Invalid password!");

        res.send("✅ Login successful!");
    } catch (err) {
        console.error(err);
        res.status(500).send("⚠ Server error during login.");
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});