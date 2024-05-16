const asyncHandler=require("express-async-handler");
const Message = require("../models/Messages");
const user = require("../models/Users");
const Chat = require("../models/Chats");

const sendMessage=asyncHandler(async (req,res)=>{
    const {content,chatId}=req.body;
    if(!content || !chatId){
        console.log("glat data hai");
        return res.sendStatus(400);
    }
    var newMessage={
        sender:req.user._id,
        content,
        chat:chatId
    }
    try {
        var message=await Message.create(newMessage);
        message=await message.populate("sender","name dp");
        message=await message.populate("chat");
        message=await user.populate(message,{
            path:"chat.users",
            select:"name dp, email username"
        })
        await Chat.findByIdAndUpdate(req.body.chatId,{
            latestMessage:message
        });
        res.json(message);
    } catch (e) {
            res.status(400);
            // Console.log("aji haa")
            throw new Error(e.message);
    }
});

const getMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name dp email username")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = { sendMessage, getMessages };
