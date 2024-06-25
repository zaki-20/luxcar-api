import User from '../models/user.model.js';

const createUser = async (userData) => {
    return await User.create(userData);
};

const findByEmail = async (email) => {
    return await User.findOne({ email });
};

const findByEmailWithPassword = async (email) => {
    return await User.findOne({ email }).select("+password");
};

const updateUserByEmail = async (email, updateData) => {
    return await User.findOneAndUpdate({ email }, updateData, { new: true });
};

const findByVerificationToken = async (token) => {
    return await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpiry: { $gt: Date.now() },
    });
};

const findByResetToken = async (resetPasswordToken) => {
    return await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  };

export default {
    createUser,
    findByEmail,
    updateUserByEmail,
    findByVerificationToken,
    findByEmailWithPassword,
    findByResetToken
};
