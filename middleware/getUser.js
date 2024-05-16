const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");
const User = require("../models/Users");

const mysign = process.env.MYSIGN;

const getUser = asyncHandler(async (req, res, next) => {
    const token = req.header('authToken');
    
    if (!token) {
        return res.status(401).json({ "Status": "Invalid Token! Please try again" });
    }
    
    try {
        const data = jwt.verify(token, mysign);
        req.user = await User.findById(data.user.id).select("-password");
        next();
    } catch (error) {
        console.error(error.message);
        res.status(401).json({ "Status": "Invalid Token! Please try again" });
    }
});

module.exports = getUser;
