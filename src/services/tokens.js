import { db } from "../db/inmemory.js";
import jwt from 'jsonwebtoken'
import {randomUUID} from 'crypto'
import { ACCESS_TTL,REFRESH_TTL,ACCESS_SECERT,REFRESH_SECRET } from "../config.js";


export function signAccessToken(user){
    const payload = {id:user.id,email:user.email}
    return jwt.sign(payload,ACCESS_SECERT,{expiresIn:ACCESS_TTL})
}

export function signRefreshToken(user){
    const jti = randomUUID()
    const payload = {id:user.id,jti}
    const token = jwt.sign(payload,REFRESH_SECRET,{expiresIn:REFRESH_TTL})
    const {exp} = jwt.decode(token)
    db.refreshTokens.set(jti,{userId:user.id,expTs:exp*1000})
    return token
}

