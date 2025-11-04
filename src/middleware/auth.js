import jwt from 'jsonwebtoken'
import { ACCESS_SECERT } from '../config.js'


export async function authorise(req,res,next){
    const {accsess_token} = req.body
    if(!accsess_token){
        res.status(404).json({msg:"Unauthorised"})
    }
    try {
         const payload = jwt.verify(accsess_token,ACCESS_SECERT)
         req.user = payload
         next()
    }
    catch(err){
      res.status(402).json({msg:"Unauthorised"})
    }
}

export async function requiredRoles(...roles){
      if (!roles.length) throw new Error('roles required')
      return (req,res,next)=>{
          if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
          if (!roles.includes(req.user.role)){
            return res.status(403).json({error:'Forbidden'})
          }
          next()
      }
}