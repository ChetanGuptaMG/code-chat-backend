const asyncHandler = require("express-async-handler");
const User = require("../models/Users");

const allUsers = asyncHandler(async (req, res) => {
  const searchQuery = req.query.search || "";

  const keyword = {
    $or: [
      { username: { $regex: searchQuery, $options: "i" } },
      { name: { $regex: searchQuery, $options: "i" } },
    ],
  };

  const users = await User.find(keyword)
    .where("_id")
    .ne(req.user._id)
    .select("-password");

  res.send(users);
});

module.exports = { allUsers };
