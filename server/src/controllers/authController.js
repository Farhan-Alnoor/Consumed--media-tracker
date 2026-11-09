import jwt from "jsonwebtoken";
import User from "../models/User.js";



const signToken = (id) =>
    jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES_IN || "7d",
    });


const publicUser = (user) => ({
    id: user._id,
    username: user.username,
    email : user.email,
});


export async function register(req,res){
    try{
        const{username,email,password} = req.body;
        if (!username || !email || !password){
            return res.status(400).json({message : "Please provide all required fields"});  
        }
    
        const user = await User.create({username,email,password});
        res.status(201).json({token : signToken(user._id),user : publicUser(user)});
    }catch(err){
        if (err.code === 11000){
            return res.status(409).json({message : "Username or email already in use"});
        }
        if (err.name === "ValidationError"){
            return res.status(400).json({message: err.message});
        }
        console.error(err);
        res.status(500).json({message: err.message})
    }
}



export async function login(req,res) {
    try{
        const {email,password} = req.body;
        if (!email|| !password){
            return res.status(400).json({message:"Email and password are required"}); 
        }
        const user = await User.findOne({email : email.toLowerCase()}).select("+password");
        if (!user || !(await user.comparePassword(password))){
            return res.status(401).json({message: "Invalid email or password"});
        }
        res.json({token : signToken(user._id),user:publicUser(user)});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message:"Server error"});
    }
    
}



export function me(req,res){
    res.json({user: publicUser(req.user)});
}