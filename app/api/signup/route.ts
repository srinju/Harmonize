import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import {z} from "zod";
import bcrypt from "bcrypt";
//signup route


const signupSchema = z.object({
    name : z.string(),
    email : z.string().email("Invalid email address").nonempty("email field is required!"),
    password : z.string().min(6,"password should be atleast of 6 charecters").nonempty("password field is empty!")
});

const prisma = new PrismaClient();

export async function POST(req : Request){

    try {
        
        const body = await req.json();
        const validateCreds = signupSchema.parse(body);
        const existingUser = await prisma.user.findUnique({
            where : {
                email : validateCreds.email
            }
        });

        if(existingUser){
            //then tail the user that user with this email already exists>
            return NextResponse.json({
                message : "user with this email already exists!!",
                
            }, {
                status : 409  
            });

        }

        //if not existing user then create the user >
        //hash the password >

        const hashedPassword = await bcrypt.hash(validateCreds.password , 10);
        const newUser = await prisma.user.create({
            data : {
                email : validateCreds.email,
                name : validateCreds.name,
                password : hashedPassword
            }
        });

        if(!newUser){
            throw new Error("error creating the new user!!");
        }

        return NextResponse.json({
            user : newUser,
            message : "user created succesfully!!"
        });

    } catch(error) {

        console.error("there was an error in the signup api endpoint!!");
        return NextResponse.json({
            message : "error occured in the signup api!"
        }, {
            status : 500
        });

    }
}