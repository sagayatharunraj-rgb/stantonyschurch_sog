// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initializing the app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB connection
const dbURI = 'your_mongodb_connection_string';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Sample Model
const Soldier = mongoose.model('Soldier', new mongoose.Schema({
    name: String,
    rank: String,
    serviceNumber: String
}));

// Routes
app.get('/soldiers', async (req, res) => {
    const soldiers = await Soldier.find();
    res.json(soldiers);
});

app.post('/soldiers', async (req, res) => {
    const soldier = new Soldier(req.body);
    await soldier.save();
    res.status(201).json(soldier);
});

app.put('/soldiers/:id', async (req, res) => {
    const soldier = await Soldier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(soldier);
});

app.delete('/soldiers/:id', async (req, res) => {
    await Soldier.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
