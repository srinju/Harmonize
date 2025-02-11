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

//const prisma = new PrismaClient();

//subscribe to the redis client when the server starts

//IF WE GET TWO MESSGES THEN REMOVE THE GLOBAL SUBSCRIBER handleRedisSubscriptions

const handleRedisSubscriptions = async () => {

    try {
        //connect the redis pub sub>
        const subscriber = await createSubscriber();

        //listen for messages in the redis channel >
        //in the particular channel when the message comes we simpley emit to all the users in the room>
        subscriber.on('message' , (message , channel) => {
            const roomId = channel.split(':')[1];
            //parsing the msg>
            const parsedMessage = JSON.parse(message);

            //forwarding the msg to all the users in the room
            io.to(roomId).emit('room-event' , parsedMessage); //sends the userID and the userName
        });

        //handling redis errors>
        subscriber.on('error' , (err) => {
            console.error("redis subscriber error!!");
        })

    } catch(error) {
        console.error("failed to initialise redis subscriber : " , error);
    }
}

handleRedisSubscriptions();


//handling client connections : >>
io.on('connection' , (socket) => {
    console.log("user connected to the ws server");

    //when user joins/subscribes the room
    socket.on('subscribe' ,  async ({roomId , userId , userName}) => {
        
        try {
            //join the room in the ws server>
            socket.join(roomId);
            console.log(`user subscribed to room ${roomId}`);

            //notify other users in the room that a new user has joined>>
            //THIS PART IS HANDLED BY THE GLOBAL SUBSCRIBER AS ANY KIND OF MESSAGE IN THE CHANNEL IS TRANSMITTED TO THE END USERS
            /*
            io.to(roomId).emit('room-event' , {
                type : 'USER_JOINED',
                user : {
                    id : userId,
                    name : userName
                }
            });
            */

        } catch(error) {
            console.error("error joing the room in the ws server!!");
        }

    });

    //handle chat messages(when clint sends a message we publish the message to the pub sub ) >
    socket.on('send-message' , ({roomId , message , userId , userName}) => {

        try{

            publishMessage(`room:${roomId}` , {
                type : 'MESSAGE',
                message,
                userId,
                userName,
                timeStamp : new Date().toISOString(),
            });

        } catch(err) {
            console.error("error publishing the message to the pub sub that  the user sent" , err);
        }

    });

    socket.on('disconnect' , () => {
        console.log("user disconnected!!");
    });

});


const PORT = 5001;

httpServer.listen(PORT  , () => {
    console.log(`web socket server is running on port ${PORT}`);
});

