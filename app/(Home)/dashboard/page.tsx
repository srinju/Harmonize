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
            console.log(data.userRooms.createdRooms);
            //console.log(data.userRooms.createdRooms);
            setRooms(data.userRooms.createdRooms || []);
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
        <div className="p-6 bg-black text-white rounded-lg shadow-md max-h-screen">
          <div className="mb-6">
            <label htmlFor="room-name" className="block text-xl font-semibold mb-2">
              Enter the name of the room to be created:
            </label>
            <input
              id="room-name"
              type="text"
              placeholder="Room Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-black text-white"
            />
          </div>
      
          <div className="mb-6">
            <button
              onClick={handleCreateRoom}
              className="w-full bg-purple-600 text-white p-3 rounded-md hover:bg-purple-700 transition-colors"
            >
              Create Room
            </button>
          </div>
      
          <div>
            <h2 className="text-2xl font-semibold mb-4">Created rooms by you:</h2>
            <div>
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <div key={room.id} className="mb-4 p-4 bg-gray-800 rounded-lg shadow-sm">
                    <p className="text-lg font-medium">Room name: {room.name}</p>
                    <p className="text-sm text-gray-400">Room Code: {room.code}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No rooms created yet! (DEV NEEDED)</p>
              )}
            </div>
          </div>
        </div>
      );
      
}