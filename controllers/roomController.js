const asyncHandler=require("express-async-handler");
const { ROOMTYPE } = require("../shared-resources/constants/controller.constants");

const  createRoom=asyncHandler(async (req,res)=>{
    const {roomType,chatId}=req.body;
    
    if(roomType === ROOMTYPE.PUBLIC)
    {
         // check if this chat id doesnot have an active session going on
         //  if going on then res.send("current session is in running") ; (iska chance hoga hi nahi);
         //  if not  start  use the uuid to create a new room , insert a roomDto
    }
    if(roomType === ROOMTYPE.RESTRICTED)
    {

    }
      
});

const joinRoom=asyncHandler(async (req,res)=>{
    try {
       
        res.json(messages);
    } catch (e) {
            res.status(400);
             
            throw new Error(e.message);
    }
});

module.exports={createRoom,joinRoom};