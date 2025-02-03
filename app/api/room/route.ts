import { authOptions } from "@/app/lib/auth";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import {z} from "zod";

//API ENDPOINT WHERE ROOM GETS CREATED

const prisma = new PrismaClient();

function generateApiKey() : string { //function to generate room code
    return randomBytes(6).toString("hex");
}

const roomSchema = z.object({
    name : z.string()
});

export async function POST(req : Request){

    const session = await getServerSession(authOptions);
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
        const roomCode = generateApiKey();

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

        console.error("room creation error " , error);
        return NextResponse.json({
            message : "there was an error in the api endpoint of the the room creation!"
        },{
            status : 500
        });
        
    }
}