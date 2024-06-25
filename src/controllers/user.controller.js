// import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
// import { User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import userService from '../services/user.service.js';
import asyncHandler from "express-async-handler";


const registerUser = asyncHandler(async (req, res, next) => {
    const user = await userService.registerUser(req);
    res.status(201).json(new ApiResponse(201, user, "User created successfully"));
});

const verifyEmail = asyncHandler(async (req, res, next) => {
    const result = await userService.verifyEmail(req)
    res.status(result.statusCode).json(new ApiResponse(result.statusCode, null, result.message));
});

const requestNewVerificationEmail = asyncHandler(async (req, res, next) => {
    await userService.requestNewVerificationEmail(req)
    res.status(201).json(new ApiResponse(200, null, "A new verification email has been sent. Please check your email inbox."));
});
  
const login = asyncHandler(async (req, res, next) => {
    const user = await userService.loginUser(req, res);
    res.status(200).json(new ApiResponse(200, user, "User logged in successfully"));
});

const forgotPassword = asyncHandler(async (req, res, next) => {
    const email = await userService.forgotPassword(req);
    res.status(200).json(new ApiResponse(200, null, `Email sent to ${email} successfully`));
  });

  const resetPassword = asyncHandler(async (req, res, next) => {
    await userService.resetPassword(req);
    res.status(200).json(new ApiResponse(200, null, "Password reset successfully"));
  });

export  {
    registerUser,
    verifyEmail,
    requestNewVerificationEmail,
    login,
    forgotPassword,
    resetPassword
};