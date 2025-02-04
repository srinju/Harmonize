"use client"

import { useEffect, useState } from "react";

type Room = {
    id: string;
    name: string;
    code: string;
    creatorId: string;
    created_at: string;  // Assuming it's a string from the backend (Date can be formatted as string)
}

export default  function DashboardPage() {
    
    const [name , setName] = useState("");
    const [rooms , setRooms] = useState<Room[]>([]);

    //get user rooms >

    useEffect(() => {
        const getUserRooms = async () => {
            const response = await fetch("api/getRooms");
            if(!response.ok){
                throw new Error("get user rooms request was not ok!");
            }
            const data = await response.json();
            console.log(data);
            setRooms(data.rooms || []);
        }
        getUserRooms();
    },[]);
    
    const handleCreateRoom = async () => {

        try {

            const response = await fetch("/api/room" , {
                method : 'POST',
                headers : {
                    "Content-Type" : "application/json",
                },
                body : JSON.stringify({name})
            });

            const data = await response.json(); //roomCode and room created data is got
            console.log("the response from the room api is  : " , data);
            
            const roomCode = data.roomCode;
            console.log("room code from the backend is : " , roomCode);
            
        } catch (err) {

            console.error("there was an error creating the room!");

        }

    }

    return (
        <div>

            <div>
                Enter the name of the room to be created :

                <input type="text"
                 placeholder="name" 
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 ></input>
            </div>
             
            <div>
                <button className="border-white" 
                onClick={handleCreateRoom}>Create Room</button>
            </div>

            <div>
                Created rooms by you : 
                <div>
                    {rooms.length > 0 ? (
                        rooms.map(room => (
                            <div>
                                <p>Room name : {room.name} </p>
                                <p>Room Code : {room.code}</p>
                            </div>
                        ))
                    ) : (
                        <p>No rooms created yet!(DEV NEEDED)</p>
                    )}
                </div>
            </div>
             
        </div>
    )
}