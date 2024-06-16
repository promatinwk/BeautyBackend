const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;


const User = require('../models/user')

router.get('/', async (req,res)=>{
  try{
    const users = await User.find();
    res.json(users);
  } catch (err){
    res.status(500).json({message: err.message})
  }
})


router.get('/:id',getUser,(req,res)=>{
   res.send(res.user);
})

//TWORZENIE UZYTKOWNIKA 
router.post('/register',async (req,res)=>{
    const { firstName, lastName, username, password, phoneNumber, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        firstName,
        lastName,
        username,
        password: hashedPassword,
        phoneNumber,
        email
    });

    try{
        const newUser = await user.save();
        res.status(201).json(newUser);
    }catch(err){
        res.status(400).json({message: err.message});
    }
})


router.put('/updateFirstName/:id', async (req, res) => {
    const userId = req.params.id;
    const { firstName } = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, { firstName: firstName }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.put('/updateLastName/:id', async (req, res) => {
    const userId = req.params.id;
    const { lastName } = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, { lastName: lastName }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/updatePassword/:id', async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.params.id;

        // Sprawdź czy użytkownik istnieje
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Porównaj stare hasło
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        // Zaktualizuj hasło
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/updateEmail/:id', async (req, res) => {
    const userId = req.params.id;
    const { email } = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, { email: email }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/updatePhoneNumber/:id', async (req, res) => {
    const userId = req.params.id;
    const { phoneNumber } = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, { phoneNumber: phoneNumber }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



//LOGOWANIE USERA

router.post('/login', async(req,res)=>{
    const { username, password } = req.body;
        try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Niepoprawny login lub hasło!' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Niepoprawny login lub hasło!' });
        }

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})


//auth
router.get('/profile/:id', verifyToken, async (req, res) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Zwróć cały obiekt użytkownika
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



async function verifyToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token is missing or invalid' });
    }
    const tokenWithoutBearer = token.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
        req.userId = decoded.id;// Dodanie id użytkownika do obiektu żądania
        next(); // Przejdź do kolejnego middleware
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: 'Invalid token' });
    }
}


async function getUser(req,res,next){
    try{
        user = await User.findById(req.params.id)
        if (user == null){
            return res.status(404).json({message: 'Cannot find user'});
        }
    }catch(err){
        return res.status(500).json({message: err.message});
    }
    res.user = user;
    next();
}


module.exports = router;