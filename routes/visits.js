const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Visit = require('../models/visit');
const Service = require('../models/service');
const Worker = require('../models/worker');
const User = require('../models/user'); // Assuming you have a User model


// Create a visit
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


// Get a visit by ID
/*
router.get('/:id', async (req, res) => {
    try {
        const visit = await Visit.findById(req.params.id)
            .populate('service')
            .populate('worker')
            .populate('client');
        
        if (!visit) {
            return res.status(404).json({ message: 'Visit not found' });
        }

        res.json(visit);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
*/

module.exports = router;
