import { authOptions } from "@/app/lib/auth";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


const prisma = new PrismaClient();

export async function GET() {

    const session = await getServerSession(authOptions);

    if(!session){
        return null;
    }

    try {

        
        const userRooms = await prisma.user.findUnique({
            where : {
                id : session.user.id
            },
            include : {
                createdRooms : true
            }
                
        });
        
        /*
        const userRooms = await prisma.user.findUnique({
            where : {
                id : session.user.id
            },
            include : {
                rooms : {
                    include : {
                        room : true
                    }
                }
            }
                
        });
        */
        console.log("userRooms : " , userRooms?.createdRooms);

        if(!userRooms){
            return NextResponse.json({
                message : "user rooms not found!"
            });
        }

        return NextResponse.json({
            message : "user rooms fetched successfully!",
            userRooms : userRooms
        });

    } catch(error){
        
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