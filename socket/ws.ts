import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createClient } from "redis";

//for the rooms created by the users the creators are already in the room 

//now >
//other users with the code will now have to check the code
//if code is same as that of the room to be joining 
//then add the user to the room (update db)
//if not then return as wrong code

const server = createServer();
const wss = new WebSocketServer({server});

//pub sub >
const client = createClient();

//connect to the redis >

(async function connectRedis() {
    
    try {
        await client.connect();
        
        await client.subscribe("room" , (message) => {
            console.log("message receved from the pub sub is  : " , message);
            const {roomMessage} = JSON.parse(message);
        })
    } catch (error) {
        console.error("there was an error connecting to the redis !");
    }
})();



