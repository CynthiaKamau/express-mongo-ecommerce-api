const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../config/jwtToken");
const generateRefreshToken = require("../config/refreshtoken");
const User = require("../models/userModel");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailController");
const crypto = require("crypto");
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

// save address
const updateUserAddres = expressAsyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongoDbId(id);
  try {
    const updatedUserAddr = await User.findByIdAndUpdate(
      id,
      {
        address: req?.body?.address,
      },
      { new: true }
    );

    res.json({
      msg: updatedUserAddr,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
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

// login admin
const loginAdmin = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Not Authorized");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?.id);
    const updateUser = await User.findByIdAndUpdate(
      findAdmin?.id,
      { refreshToken: refreshToken },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.cookie();
    res.json({
      msg: findAdmin,
      token: generateToken(findAdmin?._id),
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

// update password
const updatePassword = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json({
      msg: updatedPassword,
      success: true,
    });
  }
});

// forgot password
const forgotPasswordToken = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, Please follow this link to reset your password. This link is valid for 10 minutes from now <a href="http://localhost:5000/api/user/reset-password/${token}">Click here</a>`;
    const data = {
      to: email,
      subject: "Forgot oPassword Link",
      htm: resetURL,
      text: "Hey user",
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

//reset password
const resetPassword = expressAsyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (user) {
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({
      msg: user,
      success: true,
    });
  } else {
    throw new Error("Token expired, please try again later");
  }
});

//get users wishlist
const getWishlist = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json({
      msg: findUser,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUser,
  loginAdmin,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logoutUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  getWishlist,
  updateUserAddres,
};
