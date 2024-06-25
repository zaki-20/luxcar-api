import jwt from "jsonwebtoken"

function generateToken(user) {
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRY
    });
    return token;
}

export {generateToken}
