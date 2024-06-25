import { Router } from "express";
import { registerUser, verifyEmail, requestNewVerificationEmail, login, forgotPassword, resetPassword } from "../controllers/user.controller.js";

const router = Router()

router.route("/user/register").post(registerUser)
router.route("/user/verify-email/:token").get(verifyEmail)
router.route("/user/resend-verify-email").post(requestNewVerificationEmail)
router.route("/user/login").post(login)
router.route("/user/forgot-password").post(forgotPassword)
router.route("/user/reset-password/:token").put(resetPassword)



export default router