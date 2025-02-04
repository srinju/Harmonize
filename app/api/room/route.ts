import { authOptions } from "@/app/lib/auth";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import {z} from "zod";

//API ENDPOINT WHERE ROOM GETS CREATED

const prisma = new PrismaClient();

function generateRoomCode() : string { //function to generate room code
    return randomBytes(6).toString("hex");
}

const roomSchema = z.object({
    name : z.string()
});

export async function POST(req : Request){

    const session = await getServerSession(authOptions);
    console.log("session details : " , session);
    console.log("session id : " , session.user.id);
    if(!session){
        return NextResponse.json({
            message : "you are not authenticated!!"
        },{
            status : 401
        });
    }

    try {

        const body = await req.json();
        const validatedRoomCred = roomSchema.parse(body);
        const roomCode = generateRoomCode();

        const newRoom = await prisma.room.create({
            data : {
                name : validatedRoomCred.name,
                code : roomCode,
                creatorId : session.user.id
            }
        });

        if(!newRoom){
            throw new Error("there was an error while creating the room");
        }

        return NextResponse.json({
            room : newRoom,
            roomCode : roomCode,
            message : "room created successfully"
        },{
            status : 200
        });

    } catch(error) {

        if (error instanceof Error) {
            console.error("Room creation error:", error.message);
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