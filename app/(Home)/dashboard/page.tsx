"use client"

import { useEffect, useState } from "react";

type Room = {
    id: string;
    name: string;
    code: string;
    creatorId: string;
    created_at: string; 
}

export default  function DashboardPage() {
    
    const [name , setName] = useState("");
    const [rooms , setRooms] = useState<Room[]>([]);
    const [roomCode , setRoomCode] = useState("");

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

            const response = await fetch("/api/createRoom" , {
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

    const handleJoinRoom = async () => {

        try {

          const response = await fetch("/api/joinRoom" , {
            method : "POST",
            headers : {
              "Content-Type" : "application/json",
            },
            body : JSON.stringify({roomCode})
          });

          const data = await response.json();
          console.log("data got after clicking join room " , data);

        } catch(err){

          console.error("there was an error joinin the room!!");
        }
    }

    return (
      <div className="p-6 bg-black text-white rounded-lg shadow-md max-h-screen">
        {/* Create Room Section */}
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
    
        {/* Join Room Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Join a Room</h2>
          <label htmlFor="room-code" className="block text-lg font-medium mb-2">
            Enter Room Code:
          </label>
          <input
            id="room-code"
            type="text"
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="w-full p-3 border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-black text-white"
          />
          <button
            onClick={handleJoinRoom}
            className="w-full bg-green-600 text-white p-3 mt-3 rounded-md hover:bg-green-700 transition-colors"
          >
            Join Room
          </button>
        </div>
    
        {/* Created Rooms Section */}
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