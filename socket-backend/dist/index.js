"use strict";
// in the api/join room the user published a join message to the redis client
//now in the ws servver we will subscribe to all the redis clients 
//and on any event ,
//what we will do is we will get the room id from the message of the redis clinet
//and we will do a socket/join(roomId) .. the user joins a room
//and if the type of the message is user joined then send all the users in the room that the user joined 
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const redis_1 = require("redis");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*'
    }
});
const client = (0, redis_1.createClient)();
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send("oopysy u cant do anything here!!");
});
//connect to the redis client when the server starts>>
(function connectRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
        }
        catch (err) {
            console.error("an error occured while connecting to the redis in the ws server!! ", err);
        }
    });
})();
//const prisma = new PrismaClient();
//subscribe to the redis client when the server starts
//IF WE GET TWO MESSGES THEN REMOVE THE GLOBAL SUBSCRIBER handleRedisSubscriptions
const handleRedisSubscriptions = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        /*
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
        */
        //subscribe to the redis channel >
        yield client.pSubscribe(`room:*`, (message, channel) => {
            console.log("message received from the channel in the ws server : ", message);
            //extracting the roomID>>
            const roomId = channel.split(':')[1];
            //parsing the message that came in the channel>>
            const data = JSON.parse(message);
            console.log("parsed message from the redis channel : ", data);
            //forward the message to the redis channel when received>>
            if (data.type === 'USER_JOINED') {
                io.to(roomId).emit('room-event', {
                    type: 'USER_JOINED',
                    user: data.user
                });
            }
            else if (data.type === 'MESSAGE') {
                io.to(roomId).emit('room-event', {
                    type: 'MESSAGE',
                    message: data.message,
                    user: {
                        id: data.userId, //revalidate
                        name: data.userName //revalidate
                    },
                    timeStamp: data.timeStamp
                });
            }
        });
    }
    catch (error) {
        console.error("failed to initialise redis subscriber : ", error);
    }
});
handleRedisSubscriptions();
//handling client connections : >>
io.on('connection', (socket) => {
    console.log("user connected to the ws server");
    //when user joins/subscribes the room
    socket.on('subscribe', (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, userId, userName }) {
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
        }
        catch (error) {
            console.error("error joing the room in the ws server!!");
        }
    }));
    //handle chat messages(when clint sends a message we publish the message to the pub sub ) >
    socket.on('send-message', (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, message, userId, userName }) {
        try {
            /*
            publishMessage(`room:${roomId}` , {
                type : 'MESSAGE',
                message,
                userId,
                userName,
                timeStamp : new Date().toISOString(),
            });
            */
            //publish the message to the redis channel >>
            yield client.publish(`room:${roomId}`, JSON.stringify({
                type: 'MESSAGE',
                message,
                userId,
                userName,
                timeStamp: new Date().toISOString(),
            }));
        }
        catch (err) {
            console.error("error publishing the message to the pub sub that  the user sent", err);
        }
    }));
    socket.on('disconnect', () => {
        console.log("user disconnected!!");
    });
});
const PORT = 5001;
httpServer.listen(PORT, () => {
    console.log(`web socket server is running on port ${PORT}`);
});
