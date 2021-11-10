import { RequestHandler } from "express";
import { createHmac } from "crypto";
import User from './user.model';
import { signToken } from "../jwt";

export const signUp: RequestHandler = async (req, res) => {
    const { rut, name ,password, mail, permission_level} = req.body;

    if(!rut || !password || !name || !mail || !permission_level){
        return res.status(400).send({ succes: false, message: 'Error: datos inválidos'+ req.body });
    }

    const userFound = await User.findOne({ name });

    if(userFound){
        return res.status(301).send({ succes: false, message: 'Error: el usuario ingresado ya existe en el sistema.' });
    }

    const newUser = new User(req.body);

    await newUser.save();

    const token = signToken(newUser._id);

    return res.status(201).send({success: true,token});
}