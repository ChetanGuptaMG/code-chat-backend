const { io } = require('./index')

const SocketClients = {
  // socketid : user   //  frm all the roomid it just the number of the socket id

}

/**roomchats   rooomcode : 'chat'    */
const RoomChats = new Map();
const mapUsersToRespectiveSocket = (user, socketId) => {
  SocketClients[socketId] = user;
}
const mapRoomChatToRespectiveRoomId = (roomCode, chat) => {
 

  if (!RoomChats.has(roomCode))
    RoomChats.set(roomCode, 'console.log("hello world")');
  if (RoomChats.has(roomCode) && !chat)
    return;
  else {
    console.log(chat);
    RoomChats.set(roomCode, chat);
  }

}


module.exports = {
  mapUsersToRespectiveSocket, SocketClients, mapRoomChatToRespectiveRoomId, RoomChats
}