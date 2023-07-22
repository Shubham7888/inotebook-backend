const express = require('express');
const User = require('../models/User');
const router = express.Router();
const {body,validationResult} = require('express-validator')
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const JWT_SECRET='Shubhamboss';
var fetchuser = require('../middleware/fetchuser')

// Route1: Create i user using : POST "/api/auth/createuser". Doestn't require auth
router.post('/createuser',[
    body('name','Enter a valid name').isLength({min:3}),
    body('email','Enter a valid email').isEmail(),
    body('password','Password must be of atleast 5 characters').isLength({min:5}),
],async(req,res)=>{
    let success=false;
    //if there are errors , return the errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success,errors:errors.array()});
    }

    try{
        //check whether the user with same email already exists
   let user =await User.findOne({email: req.body.email});
  // console.log(user);
   if(user){
    return res.status(400).json({success,error: "User already exists"})
   }

   const salt = await bcrypt.genSalt(10);
   const secPass = await bcrypt.hash(req.body.password,salt);
   user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
    });

    const data={
        user:{
           id: user.id 
        }
    }

     const authtoken = jwt.sign(data,JWT_SECRET);

     success=true;

    res.json({success,authtoken});
   }
   catch(error){
    console.error(error.message);
    res.status(500).send("Internal Server Error");
   }
})


//Roue2: Authentication of user 

router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','Password can not be blank').exists(),
],async(req,res)=>{
     //if there are errors , return the errors
     let success = false;
     const errors = validationResult(req);
     if(!errors.isEmpty()){
         return res.status(400).json({errors:errors.array()});
     }

     const {email,password}=req.body;
     try{
        let user =await User.findOne({email});
        if(!user){
            success=false;
            return res.status(400).json({error:"Login with correct credentials"});
        }

      

        const passwordCompare = async(password) => {
            const match = await bcrypt.compare(password, user.password);
            return match;
        }

               
        if(!passwordCompare){
            success=false;
            return res.status(400).json({success, error:`Login  pass with correct credentials ${user.password}`}); 
        }

        const data={
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data,JWT_SECRET);
        success=true;
        res.json({success,authtoken});

     } catch(error){
    console.error(error.message);
    res.status(500).send("Internal Server Error");
   }
}
);

// Route3: Get loggedin User details using Post "/api/auth/getuser"
router.post('/getuser',fetchuser,async(req,res)=>{
try{
    let userId=req.user.id;
    const user =await User.findById(userId).select("-password");
    res.send(user);
    if(!user){
        return res.status(400).json({error:"Login with correct credentials"});
    }
}catch(error){
    console.error(error.message);
    res.status(500).send("Internal Server Error");
}
})

module.exports=router;