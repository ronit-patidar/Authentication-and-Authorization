import userModel from '../models/user.model.js'
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export async function register(req,res){
  const{username,email,password} = req.body;
  const isAlreadyRegistered = await userModel.findOne({
    $or : [
      {username},{email}
    ]
  })
  if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required",
      });
  }
  if(isAlreadyRegistered){
    res.status(409).json({
      message : "Username or email already exists"
    });
  }
  const hanshedPassword = crypto.createHash("sha256").update(password).digest("hex");
  const user = await userModel.create({
    username,
    email,
    password : hanshedPassword
  })
  const accesstoken = jwt.sign({
    id:user._id
  },config.JWT_SECRET,{
    expiresIn: "15m"
  })
  const refreshtoken = jwt.sign({
    id:user._id
  },config.JWT_SECRET,{
    expiresIn: "7d"
  })
  res.cookie("refreshtoken",refreshtoken,{
    httpOnly : true,
    secure : true,
    sameSite : "strict",
    maxAge : 7 * 24 * 60 * 60 * 100 // 7days
  })
  res.status(201).json({
    message:"User registered successfully",
    user:{
      username:user.username,
      email:user.email,
    },
    accesstoken
  })
}

export async function refreshToken(req,res){
  const refreshToken = req.cookies.refreshtoken;
  if(!refreshToken){
    return res.status(401).json({
      message:"Refresh Token not found"
    })
  }
  const decoded = jwt.verify(refreshToken,config.JWT_SECRET);
  const accessToken = jwt.sign({
    id : decoded.id
  },config.JWT_SECRET,{
    expiresIn : "15m"
  })  
  const newRefreshToken = jwt.sign({
    id:decoded.id
  },config.JWT_SECRET,{
    expiresIn : "7d"
  })
  res.cookie("refreshtoken",newRefreshToken,{
    httpOnly : true,
    secure : true,
    sameSite : "strict",
    maxAge : 7 * 24 * 60 * 60 * 100 // 7days
  })
  res.status(200).json({
    message : "Access token refreshed successfully",
    accessToken
  })
}

export async function getMe(req,res){
  const token = req.headers.authorization?.split(" ")[1];
  if(!token){
    return res.status(401).json({
      message : "token not found"
    })
  }
  const decoded = jwt.verify(token,config.JWT_SECRET);
  const user = await userModel.findById(decoded.id);
  res.status(200).json({
    message:"User fetched successfully",
    user:{
      username:user.username,
      email:user.email,
    }
  })
}
