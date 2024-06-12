const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const User = require('../models/user')

//Getting all users
router.get('/', async (req,res)=>{
  try{
    const users = await User.find();
    res.json(users);
  } catch (err){
    res.status(500).json({message: err.message})
  }
})
//Getting one user
router.get('/:id',getUser,(req,res)=>{
   res.send(res.user);
})
//Create one user - REGISTER
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
//Update one user
router.patch('/:id',getUser, async (req,res)=>{
    if (req.body.phoneNumber != null){
        res.user.phoneNumber = req.body.phoneNumber
    }
    try{
        const updatedUser = await res.user.save();
        res.json(updatedUser);
    }catch(err){
        res.status(400).json({message: err.message});
    }
})
//Delete one user

router.delete('/:id', getUser,async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(user);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


//LOGIN USER

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