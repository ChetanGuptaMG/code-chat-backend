const express = require("express");
const { sendMessage, getMessages } = require("../controllers/messageControllers");
const getuser = require("../middleware/getUser");

const router = express.Router();


router.post("/", getuser, sendMessage);
router.get("/:chatId", getuser, getMessages);

module.exports = router;
