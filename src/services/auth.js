import { db } from "../db/inmemory.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import {randomUUID} from 'crypto'
import { signAccessToken,signRefreshToken } from "./tokens.js";
import { ACCESS_SECERT } from "../config.js";

export async function  singUpHandler(req,res){
    const {email,password,userName} = req.body

    if(db.users.some((u)=>u.email === email)){
        res.json({message:"User already exisit please login"})
    }
    
    const hashedPass = await bcrypt.hash(password,10)
    const newUser = {userId:randomUUID(),email:email,userName:userName,password:hashedPass}
    db.users.push(newUser)
    res.status(201).json({id:newUser.id})
}

export async function loginHandler(req,res){
    const {email,password} = req.body
    const user = db.users.find((u)=>u.email===email)
    if(!user){
        res.status(401).json({msg:'invalid creds'})
    }
    const hashedPass = user.password
    const compare = await bcrypt.compare(password,hashedPass)
    if(!compare){
        res.status(401).json({msg:'invalid password'})
    }

    const access_token = signAccessToken(user)
    const refresh_token = signRefreshToken(user)
    res.status(201).json({userId:user.id,access_token:access_token,refresh_token:refresh_token,msg:'logIncomplete'})

}

export async function refreshTokenUpdate(req,res,next){
    try{
       const {refreshToken} = req.body
       const {jti,userId} = jwt.verify(refreshToken,ACCESS_SECERT)
       if (!db.refreshTokens.get(jti)){
        res.status(404).json({msg:'Invalid Token'})
       }
       db.refreshTokens.delete(jti)
       const access_token = signAccessToken(userId)
       const refresh_token = signRefreshToken(userId)
       res.status(201).json({access_token:access_token,refreshToken:refreshToken})
    }
    catch(err){
        if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'refresh expired' });
    }
    }
    next(err)
       
}