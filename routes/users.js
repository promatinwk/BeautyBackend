const express = require('express');
const router = express.Router();

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
//Create one user
router.post('/',async (req,res)=>{
    const user = new User({
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        username : req.body.username,
        password : req.body.password,
        phoneNumber : req.body.phoneNumber,
        email : req.body.email
    })
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