const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const users = require('./user');

const PORT = process.env.PORT || 3000;

const path = require('path');
const public = path.join(__dirname, '../public');
app.use(express.static(public));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => { 
    console.log('new user : ' + socket.id);

    // new user join to room and add it to db
    socket.on('new-user', (data, callbak) => {
        
        console.log('data from ',socket.id, data);
        let newUser = {
            id: socket.id,
            username: data.username,
            roomname: data.roomname,
            pkey: data.pkey
        };
        let {error, addedUser} = users.addUser(newUser);
        
        if(error){
            return callbak(error);
        }

        socket.join(addedUser.roomname);
        // after user adding and joining to room fire callback with value of false to show the cline there is no error
        // callbak(false);

        let getAdminStatus = users.getAdminUser(addedUser.roomname, addedUser.id);
        if(getAdminStatus.id){
            // send message to admin to get room secret key
            io.to(getAdminStatus.id).emit('send-secret-key', {id: addedUser.id, pkey: addedUser.pkey});
            callbak(false);
        } else if(getAdminStatus === false){
            // send event to user to generate room secret key as room admin user
            callbak(true);
        }

        io.to(addedUser.roomname).emit('total-users', users.roomUserCount(addedUser.roomname));
    });

    socket.on('chat-message', (data) => {
        console.log(data);
        io.to(data.roomname).emit('chat-message', data);
    });

    socket.on('disconnect', () => {
        let roomName = users.removeUser(socket.id);
        console.log(socket.id, 'user disconnected');
        if(roomName !== null){
            io.to(roomName).emit('total-users', users.roomUserCount(roomName));
        }
    });

    socket.on('group-secret-key', data => {
        console.log('group key:', data);
        io.to(data.id).emit('e2ee',{gkey: data.gkey});
    });
})

server.listen(PORT, () => console.log('Server running on port 3000'));