const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Visit = require('../models/visit');
const Service = require('../models/service');
const Worker = require('../models/worker');
const User = require('../models/user');  


// Utworzenie wizyty
router.post('/', async (req, res) => {
    const {serviceId, workerId, clientId, date } = req.body;

    try {
        const service = await Service.findById(serviceId);
        const worker = await Worker.findById(workerId);
        const client = await User.findById(clientId);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const visit = new Visit({service: serviceId, worker: workerId, client: clientId, date });
        await visit.save();

        res.status(201).json(visit);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.get('/', async (req, res) => {
    try {
        const token = req.header('Authorization');
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization token is missing or invalid' });
        }
        
        const tokenWithoutBearer = token.replace('Bearer ', '');

        try {
            const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
            if (!decoded || !decoded.id) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            


            const userId = decoded.id;
            const visits = await Visit.find({ client: userId }).populate('worker', 'firstName lastName');
            console.log(visits);

            res.json(visits);
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/updateVisitDate/:id', async (req, res) => {
    const visitId = req.params.id;
    const { newDate } = req.body;

    try {
        //Pobranie wizity ktora chcemy zaktualizowac
        const visit = await Visit.findById(visitId);
        if (!visit) {
            return res.status(404).json({ message: 'Nie znaleziono wizyty' });
        }

        // Sprawdzenie, czy pracownik nie jest zajęty w nowym terminie
        const conflictingVisit = await Visit.findOne({
            worker: visit.worker,
            date: newDate
        });

        if (conflictingVisit) {
            return res.status(400).json({ message: 'Ten pracownik posiada juz inną rezerwację na ten termin.' });
        }

        visit.date = newDate;
        await visit.save();

        res.json({ message: 'Data rezerwacji została zmieniona', visit });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.delete('/cancelVisit/:id', async (req, res) => {
    try {
        const visitId = req.params.id;

        const visit = await Visit.findByIdAndDelete(visitId);
        if (!visit) {
            return res.status(404).json({ message: 'Nie znaleziono wizyty' });
        }

        res.json({ message: 'Wizyta została anulowana!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
