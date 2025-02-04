import { PrismaClient } from "@prisma/client";
import { z} from "zod";
import bcrypt from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials"

const signinSchema = z.object({
    name : z.string(),
    email : z.string().email("Invalid email address!!").nonempty("email field is required!!"),
    password : z.string().min(6,"password should be atleast 6 charecters long!").nonempty("password field is required!")
});

const prisma = new PrismaClient();

export const authOptions = {
    providers : [
        CredentialsProvider({

            name : 'Credentials',
            credentials : {
                name : {label : "Full Name" , type : "text" , placeholder : "john" , required : true},
                email : {label : "Email"  , type : "text" , placeholder : "abcd@gmail.com" , requried : true},
                password : {label : "Password" , type : "password" , required : true}
                
            },
            async authorize(credentials : any) {

                try {
                    //zod validate >
                    const validateCreds = signinSchema.parse(credentials);
                    const existingUser = await prisma.user.findFirst({
                        where : {
                            email : validateCreds.email
                        }
                    });

                    if(existingUser){
                        //if  existing user then can signin
                        //validate password of the current user with the existing user password
                        const passwordValidation = await bcrypt.compare(validateCreds.password , existingUser.password);
                        if(passwordValidation){
                            //if pass validation true then  return the user details >
                            return {
                                id : existingUser.id.toString(),
                                name : existingUser.name,
                                email : validateCreds.email
                            }
                        }
                    }
                    return null;
                } catch(error) {
                    console.error("error occured" , error);
                    return null;
                }

            }
        })
    ],

    secret : process.env.JWT_SECTET || "secret",

    callbacks : {
        async session({token , session} : any) {

            session.user.id = token.sub;
            return session;

        }
    }
}