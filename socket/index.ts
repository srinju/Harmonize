// in the api/join room the user published a join message to the redis client
//now in the ws servver we will subscribe to all the redis clients 
//and on any event ,
//what we will do is we will get the room id from the message of the redis clinet
//and we will do a socket/join(roomId) .. the user joins a room
//and if the type of the message is user joined then send all the users in the room that the user joined 

import express from 'express'
import { createServer } from 'http';
import {Server} from 'socket.io';
import cors from 'cors';
import { createSubscriber, publishMessage } from '@/lib/redis';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer , {
    cors : {
        origin : '*'
    }
});

app.use(cors());

app.get('/' , (req,res) => {
    res.send("oopysy u cant do anything here!!");
});

//subscribe to the redis client when the server starts

(async () => {
    
    try{
        //create ther subscriber redis client
        const subscriber = await createSubscriber();
        //subscribe to all the rooms in the channel>
        await subscriber.pSubscribe('room:*' , (message , channel) => {
            const roomId = channel.split(':')[1];
            //parse the message >
            const parsedMessage = JSON.parse(message);
            //forward the message to all the users connected to the room
            io.to(roomId).emit('room-event' , parsedMessage );
        });
    } catch(error){
        console.error("an error occured connecting the redis pub sub!!" , error);
    }

})();


//handling client connections : >>
io.on('connection' , (socket) => {
    console.log("user connected to the ws server");

    //when user joins/subscribes the room
    socket.on('subscribe' , ({roomId}) => {
        socket.join(roomId);
        console.log(`user subscribed/joined to room ${roomId}`);
    });

    //handle chat messages >
    socket.on('send-message' , ({roomId , message , userId , userName}) => {
        publishMessage(`room:${roomId}` , {
            type : 'MESSAGE',
            message,
            userId,
            userName,
            timeStamp : new Date().toISOString(),
        });
    });

    //handle disconnections>
    socket.on('disconnect' , () => {
        console.log("client disconnected!!");
    });

});


const PORT = 5000;

httpServer.listen(PORT  , () => {
    console.log(`web socket server is running on port ${PORT}`);
});

