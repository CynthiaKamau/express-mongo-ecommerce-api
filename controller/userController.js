const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../config/jwtToken");
const generateRefreshToken = require("../config/refreshtoken");
const User = require("../models/userModel");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");

// new user
const createUser = expressAsyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });

  if (!findUser) {
    // Add user
    const newUser = await User.create(req.body);
    res.json({
      msg: newUser,
      success: true,
    });
  } else {
    // User already exists
    throw new Error("User already exists!");
  }
});

// login user
const loginUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?.id);
    const updateUser = await User.findByIdAndUpdate(
      findUser?.id,
      { refreshToken: refreshToken },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.cookie();
    res.json({
      msg: findUser,
      token: generateToken(findUser?._id),
      success: true,
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// get all users
const getUsers = expressAsyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find();
    res.json({
      msg: allUsers,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// get single user
const getUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongoDbId(id);
  const getUser = await User.findById(id);
  try {
    res.json({
      msg: getUser,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// update single user
const updateUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongoDbId(id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
        role: req?.body?.role,
      },
      { new: true }
    );

    res.json({
      msg: updatedUser,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// delete single user
const deleteUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongoDbId(id);
  const getUser = await User.findByIdAndDelete(id);
  try {
    res.json({
      msg: getUser,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//block user
const blockUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      { new: true }
    );

    res.json({
      msg: "User blocked",
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//unblock user
const unblockUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      { new: true }
    );

    res.json({
      msg: "User unblocked",
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// handle refresh token
const handleRefreshToken = expressAsyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("No refresh token in cookies");
  }
  const refreshToken = cookie?.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No refresh token found in db or no match found");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded?.id) {
      throw new Error("There is something wrong with refresh token");
    } else {
      const accessToken = generateToken(user?.id);
      res.json({ accessToken });
    }
  });
});

// logout
const logoutUser = expressAsyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("No refresh token in cookies");
  }
  const refreshToken = cookie?.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.sendStatus(204); // forbidden
});

module.exports = {
  createUser,
  loginUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logoutUser,
};
