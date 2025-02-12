"use client"
//in rooom that is when the user clicks on any room it is inside the room>>

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

//in this page there will be a ws connection which will show all the chat messages for now 

const socket = io("http://localhost:5001");

export default function inRoomPage() {

    const[messages , setMessages] = useState([]);
    const[chatInput , setChatInput] = useState("");

    const handleSubmitMessage = async () => {

        socket.on('message' , (data) => {

            console.log("message from the ws server : ", data); 
            console.log("user name : " , data.user.name);

            setMessages(data); //set the message as the data that came.
        })
    }

    return (
        <div>
            <div>
                <h1>Messages : </h1>

                <div>
                    {messages.map((msg) => (
                        <div>
                            //user message and user name
                        </div>
                    ))}
                </div>
            </div>
            
            <div>
                type message : 
                <div>
                    <input type="text"  placeholder="ur messag here" onChange={(e) => setChatInput(e.target.value)}></input>
                </div>
                <div>
                    <button 
                        onClick={handleSubmitMessage}
                        className="border-white">
                    send
                    </button>
                </div>
            </div>
        </div>
    )
      
}