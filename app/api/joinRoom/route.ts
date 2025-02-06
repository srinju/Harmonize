

//user with a code sends request 
//validate the code with the room
//add the user to that room
//publish a message to that room that the user joined

import {z} from 'zod';
import { authOptions } from "@/app/lib/auth";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from 'next/server';
import { publishMessage } from '@/lib/redis';

const prisma = new PrismaClient();

const roomCodeSchema = z.object({
    roomCode : z.string().min(6,"code should be atleast 6 charecters long").nonempty("code is required to join the room!")
});
    
export async function POST(req : Request){

    const session = await getServerSession(authOptions);
    if(!session){
        return null;
    }

    try{
        //user sends the code
        const body = await req.json();
        console.log("body received from the user!! : " , body);
        const parsedBody =  roomCodeSchema.parse(body);
        console.log("parsed body : " , parsedBody);

        //check the database if the code exists in the database
        //if it exists then find the room the code is for 

        const roomToJoin = await prisma.room.findUnique({
            where : {
                code : parsedBody.roomCode
            }
        });

        if(!roomToJoin){
            return NextResponse.json({
                message : "the code is not correct! , please enter the correct code for the room!"
            },{
                status : 404
            })
        }

        //else condition  :
        //room code correct 
        //join add the user to the room

        const userId = session.user.id;
        const userName = session.user.name;
        //update room with the user's name>
        //target the many to many relationship userroom to add the user to the room
        //some shit was there like include : { user : { select :  { id , name , image }}} if dosent work look at it
        
        const addUser = await prisma.userRoom.create({
            data : {
                userId : userId,
                roomId : roomToJoin.id
            }
        });

        //user has been added to the room
        //notify the members in the room that the user joined (USING PUBLISHER)

        //publish to redis channel >
        
        await publishMessage(`room:${roomToJoin.id}` , {
            type : 'USER_JOINED',
            user : {
                id : userId,
                name : userName
            },
        });

        //a published message to the pub sub is gone from this primary backend 
        //and the websocket server will listen to any subscribed messages of types
        

        return NextResponse.json({
            addedUser : addUser,
            message : "user was added to the room!!"
        },{
            status : 200
        });

    } catch(error){

        if (error instanceof Error) {
            console.error("Room joining error:", error.message);
        } else {
            console.error("Unknown error occurred:", error);
        }
    
        // Return a proper JSON response
        return NextResponse.json(
            {
                message: "There was an error in the API endpoint for room creation!",
                error: error instanceof Error ? error.message : "Unknown error",  // Ensure a proper error message is returned
            },
            { status: 500 }
        );
    }
}


