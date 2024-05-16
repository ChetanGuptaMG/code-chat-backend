const express = require("express");
const { createRoom } = require("../controllers/roomController");

const router = express.Router();

router.post('/create-room', createRoom);

module.exports = router;
