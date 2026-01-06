import express, { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET

export function authMiddleware(req: Request, res: Response, next: NextFunction){
    const token = req.headers['Authorization'];
    if(!token || typeof token !== "string"){
        return res.status(401).json({
            message: "Token not sent or incorrect token format."
        })
    }

    if(!JWT_SECRET){
        return res.status(401).json({
            message: "No JWT Secret given."
        });
    }

    try{
        const payload = jwt.verify(token, JWT_SECRET); // this returns the user id, though its not usable anywhere
        res.json({ // optional, for testing purposes
            message: "successful log in",
            payload: payload
        })
        next();
    } catch (err){
        return res.status(401).json({
            message: "Error: Invalid token"
        })
    }
}