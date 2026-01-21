import { type NextFunction, type Request, type Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET

interface AuthPayload extends JwtPayload {
  id: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction){
    if(!JWT_SECRET){
        return res.status(401).json({
            message: "No JWT Secret given."
        });
    }
    
    const token = req.headers.authorization;
    console.log(token)
    if(!token || typeof token !== "string"){
        return res.status(401).json({
            message: "Token not sent or incorrect token format."
        })
    }

    try{
        const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
        req.userId = payload.id;
        next();
    } catch (err){
        return res.status(401).json({
            message: "Error: Invalid token"
        })
    }
}