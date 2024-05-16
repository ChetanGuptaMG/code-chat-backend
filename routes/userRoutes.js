const express = require("express");
const { allUsers } = require("../controllers/userControllers");
const getUser = require("../middleware/getUser");

const router = express.Router();


router.get("/", getUser, allUsers);

module.exports = router;
