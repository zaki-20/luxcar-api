import userRepository from '../repositories/user.respository.js';
import {ApiError} from '../utils/ApiError.js';
import sendEmail from '../utils/sendMail.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt'
import { generateToken } from '../utils/generateToken.js';



const generateTokenAndExpiry = () => {
    const token = crypto.randomBytes(20).toString('hex');
    const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; 
    return { token, tokenExpiry };
};

const saveUser = async (userDetails, isUpdate = false) => {
    const { email, username, password, token, tokenExpiry } = userDetails;

    const userPayload = {
        username,
        email,
        password,
        emailVerificationToken: token,
        emailVerificationExpiry: tokenExpiry,
        isVerified: false,
    };

    if (isUpdate) {
        return await userRepository.updateUserByEmail(email, userPayload);
    } else {
        return await userRepository.createUser(userPayload);
    }
};

//===========================================================================
const registerUser = async (req) => {

const { username, email, password } = req.body;
const existingUser = await userRepository.findByEmail(email);

if(existingUser){
    if(existingUser.isEmailVerified){
      throw new ApiError(400, 'Email already exists');
    } else {

        const { token, tokenExpiry } = generateTokenAndExpiry();
         const updatedUser = await saveUser({
                email,
                username,
                password,
                token,
                tokenExpiry,
            }, true); //  isUpdate is true

            const verificationUrl = `${req.protocol}://${req.get(
                "host"
              )}/api/v1/user/verify-email/${token}`;
            const message = `Hello ${username},\n\nPlease click on the following link to verify your email:\n${verificationUrl}`;

            await sendEmail({
                email,
                subject: 'LUX CAR Email Verification',
                message
            }, 'text');

            return updatedUser;
    }
} else {
    const { token, tokenExpiry } = generateTokenAndExpiry();

    const newUser = await saveUser({
        email,
        username,
        password,
        token,
        tokenExpiry,
    }); //  isUpdate is false by default

    const verificationUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/user/verify-email/${token}`;
    const message = `Hello ${username},\n\nPlease click on the following link to verify your email:\n${verificationUrl}`;

    await sendEmail({
        email,
        subject: 'LUX CAR Email Verification',
        message
    }, 'text');

    return newUser;
}

};

const verifyEmail = async (req) => {
const user = await userRepository.findByVerificationToken(req.params.token);

if(!user){
    throw new ApiError(400, 'Invalid or expired verification token ');
}

if (user.isEmailVerified) {
    throw new ApiError(400, 'Email is Already verified');
}

user.emailVerificationToken = undefined;
user.emailVerificationExpiry = undefined;
user.isEmailVerified = true;
await user.save();

const message = `Hello ${user.username},\n\nYour email has been verified successfully.`;
await sendEmail({ email: user.email, subject: 'Email Verified', message }, 'text');

return { statusCode: 200, message: 'Email verification successful. You can now login.' };


};

const requestNewVerificationEmail = async (req) => {
    const existingUser = await userRepository.findByEmail(req.body.email);
    console.log("existingUser", existingUser)
    if(!existingUser){
        throw new ApiError(400, 'User not found');
    }
    
    if (existingUser.isEmailVerified) {
        throw new ApiError(400, 'Email is Already verified');
    }
    
    const { token, tokenExpiry } = generateTokenAndExpiry();
    existingUser.emailVerificationToken = token ;
    existingUser.emailVerificationExpiry = tokenExpiry ;
    await existingUser.save();
    
    const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${
        existingUser.emailVerificationToken
      }`;
    const message = `Hello ${existingUser.username},\n\nPlease click on the following link to verify your email:\n${verificationUrl}`;
    
    await sendEmail({ email: existingUser.email, subject: 'LUX CAR Email Verification', message }, 'text');
     
};

const loginUser = async (req) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
        throw new ApiError(400, 'please enter email and password');
    }

    const user = await userRepository.findByEmailWithPassword(email);

    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isEmailVerified) {
        throw new ApiError(401, 'Email is not verified. Please verify your email to log in.');
    }
  
    const isPasswordMatch = await user.isPasswordCorrect(password);
  
    if (!isPasswordMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }
  
    const token = generateToken(user);
    return { user, token}
};
  
const forgotPassword = async (req) => {

    const user = await userRepository.findByEmail(req.body.email);

    if (!user) {
        throw new ApiError(404, 'user not found');
    }
  
    if (!user.isEmailVerified) {
        throw new ApiError(401, 'Email is not verified. Please verify your email to log in');
    }

    const resetToken = await user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
  
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/api/user/reset-password/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;
  
    try {
        await sendEmail(
            {
              email: user.email,
              subject: 'LUX CAR Password Recovery',
              message,
            },
            'text'
          );
        return user.email
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(500, error.message);
    }

};

const resetPassword = async (req) => {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

      console.log(resetPasswordToken)
  
    const user = await userRepository.findByResetToken(resetPasswordToken);
      
    if (!user) {
        throw new ApiError(400, 'Reset Password Token is invalid or has expired');
    }
  
    if (req.body.newPassword !== req.body.confirmPassword) {
      throw new ApiError(400, 'Password does not match');
    }
  
    user.password = req.body.newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
  
    await user.save();

    return

};

export default {
    registerUser,
    verifyEmail,
    requestNewVerificationEmail,
    loginUser,
    forgotPassword,
    resetPassword
};
