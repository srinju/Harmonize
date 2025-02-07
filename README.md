
# steps >

1. authentication backend done

2. now the user will have to create a room and the backend will return a code -d

3. room creation logic and code sharing done -d
 modify many to many in schema db -d

4. other user joining the same room with that code 
    room is a web socket server now

    api/joinRoom done>

    the user published a message to the room id channel (room)
    now we have to subscribe to that room id in the ws server and when we get the user joined message from the redis then we will make the user join the room in the ws server  we will broadcast the message from the ws server to all the users in the room

5. sending messages 

6. song mechanism

7. upvoting system

8. most upvoted gets played .