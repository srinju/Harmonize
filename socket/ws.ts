import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createClient } from "redis";

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



