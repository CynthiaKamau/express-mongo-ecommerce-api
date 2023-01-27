const Coupon = require('../models/couponModel')
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

// create new coupon
const createCoupon = asyncHandler(async (req, res) => {
    const body = req.body;
    try {
        const coupon = await Coupon.create(body);
        res.json({
            msg: coupon,
            success: true
        })
    } catch (error) {
        throw new Error(error)
    }
    
})

// get all coupons
const getCoupons = asyncHandler(async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.json({
            msg: coupons,
            success: true
        })
    } catch (error) {
        throw new Error(error)
    }
})

// get a coupon
const getCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const coupon = await Coupon.findById(id)
        res.json({
            msg: coupon,
            success: true
        })
    } catch (error) {
        throw new Error(error)
    }
})

// update coupon 
const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const coupon = await Coupon.findByIdAndUpdate(id, {
            name: req.body?.name,
            expiry: req.body?.expiry,
            discount: req.body?.discount
        }, {new: true})
        res.json({
            msg: coupon,
            success: true
        })
    } catch (error) {
        throw new Error(error)
    }
})

// delete a coupon
const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const coupon = await Coupon.findByIdAndDelete(id)
        res.json({
            msg: coupon,
            success: true
        })
    } catch (error) {
        throw new Error(error)
    }
})


module.exports = { createCoupon, getCoupon, getCoupons, updateCoupon, deleteCoupon }