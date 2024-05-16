const connectToMongo = require("./db")
const express = require("express")
var cors = require('cors')
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const roomRoutes = require('./routes/roomRoutes')

const app = express()
const dotenv = require("dotenv")
dotenv.config({ path: './config.env' })
const port = process.env.PORT
const { notFound, errorHandler } = require("./middleware/error");
const { mapUsersToRespectiveSocket, SocketClients, mapRoomChatToRespectiveRoomId, RoomChats } = require("./socket");
const { ACTIONS } = require('./socketactions')

connectToMongo();
app.use(cors())
app.use(express.json());   


app.get("/", (req, res) => {
  res.send("Hello TG")
})

app.use('/api/auth', require('./routes/auth.js'))
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use('/room', roomRoutes)
app.use(notFound);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`CodeChat is listening on port ${port}`)
})

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
  }
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io", socket.id);
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
  socket.on(ACTIONS.JOIN, ({ roomCode, user }) => {
    console.log(user, '------------------ new user ------------')
    mapUsersToRespectiveSocket(user, socket.id);
    mapRoomChatToRespectiveRoomId(roomCode, undefined);
    socket.join(roomCode);
    /**
     * io .socket.adaptor .room {
     *   roomid  --- > set of socketid{}
     *   rooomid ---> setof  socketid {}
     * }
     */
    const clients = getAllClients(roomCode);
    clients.forEach(({ socketid }) => {
      console.log(RoomChats);

      io.to(socketid).emit(ACTIONS.SOMEONE_JOINED,
        {
          clients,
          socket: socket.id,
          user: user,
          currentEditorCode: RoomChats.get(roomCode)
        })
    })


  })

  // this will be called when some user closes the tab or leave the editor

  socket.on(ACTIONS.DISCONNECTING, () => {
    const rooms = [...socket.rooms];

    console.log(rooms);
    rooms.forEach((roomCode) => {
      socket.in(roomCode).emit(ACTIONS.DISCONNECTED, {
        clients: getAllClients(roomCode),
        socket: socket.id,
        user: SocketClients[socket.id],
        editorCode: RoomChats.get(roomCode)
      })
    })
    delete SocketClients[socket.id];
    socket.leave();
  })


  // listen to code changes 
  socket.on(ACTIONS.CODE_CHANGE, ({ code, roomCode }) => {
    mapRoomChatToRespectiveRoomId(roomCode, code)
    socket.in(roomCode).emit(ACTIONS.CODE_CHANGE, { code: RoomChats.get(roomCode) })   // this will sent  codechange event to all the clients in room 
  })
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});



const getAllClients = (roomCode) => {
  // io.sockets.adapter.rooms.get(roomCode) // this return the map which has the socket id as a key and 
  return Array.from(io.sockets.adapter.rooms.get(roomCode) || []).map((socketid) => {
    return {
      socketid,
      user: SocketClients[socketid]
    }
  }); // this return those  socketsid which has the same id 

}
module.exports = {
  io
}


