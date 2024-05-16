const asyncHandler=require("express-async-handler");
const Chat = require("../models/Chats");
const user = require("../models/Users");

const accessChats = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        console.log("Not received userId");
        return res.sendStatus(400);
    }
    const isChat = await Chat.findOne({
        isGroupChat: false,
        users: { $all: [req.user._id, userId] }
    }).populate("users", "-password").populate("latestMessage").populate({
        path: 'latestMessage.sender',
        select: "name dp email"
    });
    if (isChat) {
        res.send(isChat);
    } else {
        const chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId]
        };
        try {
            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
            res.status(200).send(fullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});

const getChats = asyncHandler(async (req, res) => {
    try {
        const result = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

        await user.populate(result, {
            path: 'latestMessage.sender',
            select: "name dp email"
        });

        res.status(200).send(result);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const createGroupChat = asyncHandler(async (req, res) => {
    const { users, name } = req.body;
    if (!users || !name) {
        return res.status(400).send({ message: "Please fill all the fields!" });
    }
    const parsedUsers = JSON.parse(users);
    if (parsedUsers.length < 2) {
        return res
            .status(400)
            .send({ message: "Minimum two users are required to form a group chat!" });
    }
    parsedUsers.push(req.user);
    try {
        const groupChat = await Chat.create({
            chatName: name,
            users: parsedUsers,
            isGroupChat: true,
            groupAdmin: req.user,
        });
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id }).populate(
            "users",
            "-password"
        ).populate("groupAdmin", "-password");
        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const renameGroupChat=asyncHandler(async (req,res)=>{
    const {chatId,chatName}=req.body;
    const updatedChat=await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName
        },
        {
            new:true
        }
    ).populate("users","-password").populate("groupAdmin","-password");

    if(!updatedChat){
        res.status(404);
        throw new Error("Chat Not Found!");
    }
    else res.json(updatedChat);

});

const addToGroupChat=asyncHandler(async (req,res)=>{
    const {chatId,userId}=req.body;
    const addedUser= await Chat.findByIdAndUpdate(chatId,{
        $push:{users:userId},
    },
        {new:true}
    ).populate("users","-password").populate("groupAdmin","-password");
     if(!addedUser){
        res.status(404);
        throw new Error("Chat Not Found!");
    }
    else res.json(addedUser);
    });

const removeFromGroupChat=asyncHandler(async (req,res)=>{
    const {chatId,userId}=req.body;
    const removedUser= await Chat.findByIdAndUpdate(chatId,{
        $pull:{users:userId},
    },
        {new:true}
    ).populate("users","-password").populate("groupAdmin","-password");
     if(!removedUser){
        res.status(404);
        throw new Error("Chat Not Found!");
    }
    else res.json(removedUser);
    });

module.exports={accessChats,getChats,createGroupChat,renameGroupChat,addToGroupChat,removeFromGroupChat};