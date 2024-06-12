const express = require('express');
const router = express.Router();

const Worker = require('../models/worker');
const Service = require('../models/service');





// Create a worker
router.post('/', async (req, res) => {
    const worker = new Worker({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        services: req.body.services //Tablica z id usług które moze wykonywac pracownica
    });

    try {
        const newWorker = await worker.save();
        res.status(201).json(newWorker);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Pobieranie uzytkownikow przypisanych do danej uslugi
router.get('/by-service/:serviceId', async (req, res) => {
    try {
        const workers = await Worker.find({ services: req.params.serviceId });
        res.json(workers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;