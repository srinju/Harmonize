"use client"

import { useEffect, useState } from "react";
import io from "socket.io-client";

type Room = {
    id: string;
    name: string;
    code: string;
    creatorId: string;
    created_at: string; 
}

const socket = io("http://localhost:5000"); //connect to the ws server

export default  function DashboardPage() {
    
    const [name , setName] = useState("");
    const [rooms , setRooms] = useState<Room[]>([]);
    const [inRooms , setInRooms] = useState<Room[]>([]);
    const [roomCode , setRoomCode] = useState("");

    //get the ws shit on mount>

    useEffect(() => {
        socket.on('USER_JOINED' , (data) => {
          console.log("user joined : " , data);
        });

        return () => {
          socket.off("USER_JOINED");
          console.log("socket turned off for user joined!!");
        }
    },[]);
    

    //get user rooms >

    useEffect(() => {
        const getUserRooms = async () => {
            const response = await fetch("api/getRooms");
            if(!response.ok){
                throw new Error("get user rooms request was not ok!");
            }
            const data = await response.json();
            console.log("created rooms by the user : " ,data.createdRooms.createdRooms);
            console.log("rooms the user is in : ", data.userRooms);

            setRooms(data.createdRooms.createdRooms || []);
            const userRooms = data.userRooms.map((ur:any) => ur.room);
            setInRooms(userRooms);
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
            //refresh rooms list after creation >
            const refreshResponse = await fetch("api/getRooms");
            const refreshData = await refreshResponse.json();
            setRooms(refreshData.createdRooms.createdRooms || []);
            setInRooms(refreshData.userRooms.map((ur:any) => ur.room));
            console.log("the response from the room api is  : " , data);

            setName(""); //clear the input too
            
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

          //ws logic where the user sends a subscribe message to the ws server
          socket.emit("subscribe" , {roomId : data.roomId}); //this message goes to the ws servver then the user joins the socket.joim(roomId)

        } catch(err){

          console.error("there was an error joinin the room!!");
        }
    }

    console.log("rooms created by the user state : " , rooms);
    console.log("in rooms state : " , inRooms);

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

        {/* rooms the user is in  Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Rooms you are in : </h2>
          <div>
            {inRooms.length > 0 ? (
              inRooms.map((inRoom) => (
                <div key={inRoom.id} className="mb-4 p-4 bg-gray-800 rounded-lg shadow-sm">
                  <p className="text-lg font-medium">Room name: {inRoom.name}</p>
                  <p className="text-sm text-gray-400">Room Code: {inRoom.code}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">"you are not in any rooms yet!</p>
            )}
          </div>
        </div>
      </div>
    );
    
      
}