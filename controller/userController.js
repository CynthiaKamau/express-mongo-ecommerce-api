const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const createUser = expressAsyncHandler(async(req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });

    if(!findUser) {
        // Add user
        const newUser = await User.create(req.body);
        res.json({
            msg: newUser,
            success: true
        });

    } else {
        // User already exists
        throw new Error('User already exists!');
    }
})

module.exports = createUser;