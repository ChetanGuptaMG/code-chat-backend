const express = require("express");
const { accessChats, getChats, createGroupChat, renameGroupChat, addToGroupChat, removeFromGroupChat } = require("../controllers/chatControllers");
const getuser = require("../middleware/getUser");

const router = express.Router();


router.post("/", getuser, accessChats);
router.get("/", getuser, getChats);
router.post("/group", getuser, createGroupChat);
router.put("/rename", getuser, renameGroupChat);
router.put("/addGroup", getuser, addToGroupChat);
router.put("/removeGroup", getuser, removeFromGroupChat);

module.exports = router;
