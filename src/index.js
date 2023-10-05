const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const logger = require('../loggers/index');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const port = 3000 || process.env.PORT;
app = express()
const server = http.createServer(app);
const io = socketio(server);


const publicPathDirectory = path.join(__dirname, '../public');
app.use(express.static(publicPathDirectory));
io.on('connection', (socket) => {

    socket.on('join', ({ username, room }, callback) => {
        const { user, error } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    })

    //receive message from clients  and share to all clients
    socket.on('sendMessage', (message, callback) => {
        //socket.broadcast.emit('message',message);

        //checking for message contains any bad words
        let filter = new Filter();
        if (filter.isProfane(message)) {
            logger.warn("Sorry Message contains profanity");
            return callback('Sorry Message contains profanity');
        }

        //get user by their id
        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback('Delivered');
    });

    //receive location from clients nd share to other clients
    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('messageLocation', generateLocationMessage(user.username, `https://www.google.com/maps?q=${location.latitude},${location.longitude}`));
        callback('Location Shared');
    });

    //when user disconnect
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} is left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    });
});


server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});