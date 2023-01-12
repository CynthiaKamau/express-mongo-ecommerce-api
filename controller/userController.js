const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../config/jwtToken");
const User = require("../models/userModel");

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
        success: true
    })
  } catch (error) {
    throw new Error(error);
  }
});

//unblock user
const unblockUser = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
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
        success: true
      })
    } catch (error) {
      throw new Error(error);
    }
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
};
