import nodeMailer from "nodemailer";

// const fs = require('fs');
// const path = require('path');
import emailConfig from "./emailConfig.js";

const createTransporter = () => {
    return nodeMailer.createTransport(emailConfig.smtp);
};


const sendEmail = async (options, contentType = 'html') => {
    try {

        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: options.email,
            subject: options.subject,
        };

        if (contentType === 'text') {
            mailOptions.text = options.message;
        } 
    
        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export default sendEmail
