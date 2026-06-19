import {User} from "../schema/auth.js";

import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

import { sendSuccess, sendError } from "../utils/response.js";

const generateToken=(userId)=>{
    return jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn: "7d",
    });
}

const generateResetToken=()=>{
    return crypto.randomBytes(32).toString("hex");
}

const validateEmail=(email)=>{
    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const validatePassword=(password)=>{
     const passwordRegex=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
     return passwordRegex.test(password) && password.length >= 8;
}

const createTransporter=()=>{
    return nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        }
    });
};

export const sendVerificationEmail=async(user,verificationToken)=>{
    try{
    const transporter=createTransporter();
    const verifyUrl=`${process.env.BASE_URI ||'http://localhost:3000' }/api/v1/auth/verify/${verificationToken}`
    
    await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'JudgeX'} Support" <${process.env.MAIL_USERNAME}>`,
        to:user.email,
        subject: "Verify your email",
        html: `
        <div style="background:#f4f7fb;padding:40px 20px;font-family:'Segoe UI',Arial,sans-serif;">
            <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:40px 30px;text-align:center;">
                    <h1 style="color:white;margin:0;font-size:32px;">
                        Welcome to JudgeX 🚀
                    </h1>
                    <p style="color:rgba(255,255,255,0.9);margin-top:10px;font-size:16px;">
                        Your coding journey starts here.
                    </p>
                </div>
            <div style="padding:40px 30px;">
                <h2 style="color:#111827;margin-bottom:15px;">
                    Hi ${user.name || 'Coder'} 👋
                </h2>

                <p style="color:#4b5563;line-height:1.8;">
                    Thank you for joining JudgeX. To activate your account and start solving coding challenges, please verify your email address.
                </p>

                    <div style="text-align:center;margin:35px 0;">
                        <a href="${verifyUrl}"
                        style="
                                display:inline-block;
                                background:linear-gradient(135deg,#2563eb,#7c3aed);
                                color:white;
                                text-decoration:none;
                                padding:14px 32px;
                                border-radius:10px;
                                font-weight:600;
                                font-size:16px;
                                box-shadow:0 8px 20px rgba(59,130,246,0.25);
                        ">
                            Verify Email
                        </a>
                    </div>

                <p style="color:#6b7280;font-size:14px;">
                    If the button doesn't work, copy and paste the following link into your browser:
                </p>

                <div style="
                    background:#f9fafb;
                    border:1px solid #e5e7eb;
                    padding:15px;
                    border-radius:10px;
                    word-break:break-all;
                    color:#374151;
                    font-size:13px;
                ">
                    ${verifyUrl}
                </div>

                <div style="
                    margin-top:30px;
                    padding:18px;
                    border-left:4px solid #2563eb;
                    background:#eff6ff;
                    border-radius:8px;
                ">
                    <p style="margin:0;color:#1e40af;font-size:14px;">
                      If you didn't request a password reset, please ignore this email. Your account remains secure.
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="
                border-top:1px solid #e5e7eb;
                padding:25px;
                text-align:center;
                background:#fafafa;
            ">
                <p style="margin:0;color:#6b7280;font-size:13px;">
                    Need help? Contact the JudgeX support team.
                </p>

                <p style="margin-top:15px;color:#9ca3af;font-size:12px;">
                    © ${new Date().getFullYear()} JudgeX. All rights reserved.
                </p>
            </div>

        </div>
    </div>
    `});
    console.log('reset password email sent to:', user.email);
    }catch(error){
        console.error('Error sending reset password :', error);
        throw error;
    }
};



export const sendPasswordResetEmail=async(user,resetToken)=>{
    try{
    const transporter=createTransporter();
    const resetUrl=`${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`
    
    await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'JudgeX'} Support" <${process.env.MAIL_USERNAME}>`,
        to:user.email,
        subject: "Reset your password",
        html: `
        <div style="background:#f4f7fb;padding:40px 20px;font-family:'Segoe UI',Arial,sans-serif;">
            <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:40px 30px;text-align:center;">
                    <h1 style="color:white;margin:0;font-size:32px;">
                       Reset Your Password 🔐
                    </h1>
                    <p style="color:rgba(255,255,255,0.9);margin-top:10px;font-size:16px;">
                        Secure access to your JudgeX account
                    </p>
                </div>
            <div style="padding:40px 30px;">
                <h2 style="color:#111827;margin-bottom:15px;">
                    Hi ${user.name || 'Coder'} 👋
                </h2>

                <p style="color:#4b5563;line-height:1.8;">
                    We received a request to reset the password for your JudgeX account. Click the button below to create a new password.
                </p>

                    <div style="text-align:center;margin:35px 0;">
                        <a href="${resetUrl}"
                        style="
                                display:inline-block;
                                background:linear-gradient(135deg,#2563eb,#7c3aed);
                                color:white;
                                text-decoration:none;
                                padding:14px 32px;
                                border-radius:10px;
                                font-weight:600;
                                font-size:16px;
                                box-shadow:0 8px 20px rgba(59,130,246,0.25);
                        ">
                            Reset Passowrd
                        </a>
                    </div>

                <p style="color:#6b7280;font-size:14px;">
                    If the button doesn't work, copy and paste the following link into your browser:
                </p>

                <div style="
                    background:#f9fafb;
                    border:1px solid #e5e7eb;
                    padding:15px;
                    border-radius:10px;
                    word-break:break-all;
                    color:#374151;
                    font-size:13px;
                ">
                    ${resetUrl}
                </div>

                <div style="
                    margin-top:30px;
                    padding:18px;
                    border-left:4px solid #2563eb;
                    background:#eff6ff;
                    border-radius:8px;
                ">
                    <p style="margin:0;color:#1e40af;font-size:14px;">
                        ⚠️ This password reset link will expire in 10 minutes.
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="
                border-top:1px solid #e5e7eb;
                padding:25px;
                text-align:center;
                background:#fafafa;
            ">
                <p style="margin:0;color:#6b7280;font-size:13px;">
                    If you didn't create an account, you can safely ignore this email.
                </p>

                <p style="margin-top:15px;color:#9ca3af;font-size:12px;">
                    © ${new Date().getFullYear()} JudgeX. All rights reserved.
                </p>
            </div>

        </div>
    </div>
    `});
    console.log('Verification email sent to:', user.email);
    }catch(error){
        console.error('Error sending verification email:', error);
        throw error;
    }
};


export const initializeAdmin=async()=>{
    try{
        const existAdmin=await User.findOne({role:'admin'});
        if(!existAdmin){
            const defualtAdmin=new User({
                userName:'Judgex',
                name:'JudgeXname',
                email:process.env.ADMIN_EMAIL,
                password:process.env.ADMIN_PASSWORD,
                role:'admin',
                verified:true,
            })
            await defualtAdmin.save();
        }
    }catch(error){
        console.error('Error initializing admin account:', error);

    }
}

export const createAdmin=async(req,res)=>{
    try{
        const {userName,name,email,password}=req.validated.body;
        if(!userName || !name || !email || !password){
            return sendError(res,400,"All fields are required");
        }
        const query=[];
        if(email) query.push({email});
        if(userName) query.push({userName});
        const existingUser=await User.findOne({$or:query});
        if(existingUser){
            return sendError(res,400,"User already exists");
        }


        const adminUser=new User({
            userName,
            name,
            email,
            password,
            role:'admin',
            verified:true,
        })
        await adminUser.save();
        return sendSuccess(res,201,"Admin created successfully",adminUser);

    }catch(error){
        return sendError(res,500,"Internal server error");
    }
}


export const registerController=async(req,res)=>{
    try{

        const {userName,name,email,password}=req.validated.body;
        const existingUser=await User.findOne({
            $or:[{email},{userName}]
        });

        if(existingUser){
            if(existingUser.verified){
                return sendError(res,400,"user already exists");
            }else{
                await User.deleteOne({_id:existingUser._id});
            }
        }
        const verificationToken=crypto.randomBytes(32).toString("hex");
        const newUser=new User({
            userName,
            name,
            email,
            password,
            verified:false,
            verificationToken
        })

        await newUser.save();
        try{
            await sendVerificationEmail(newUser,verificationToken)
        }catch(emailError){
            console.error('Failed to send verification email:', emailError)
        }

        const token=generateToken(newUser._id);
        const userResponse={
            id:newUser._id,
            userName:newUser.userName,
            name:newUser.name,
            role:newUser.role,
            avatar:newUser.avatar,
            verified:newUser.verified,
            createdAt: newUser.createdAt
        }
        return sendSuccess(res,201,"User registered successfully. Please check your email to verify your account.",{
            user:userResponse,
            token
        })
    }catch(error){
        console.error("Registration error:", error);
        return sendError(res,500,"Internal server error. Please try again later.");
    }
}

export const verifyUser=async(req,res)=>{
      try{
        const {verificationToken}=req.validated.params;
        const user=await User.findOne({verificationToken});
        if(!user){
            return sendError(res,404,"Invalid or expired verification token");
        }

        user.verified=true;
        user.verificationToken=undefined;
        await user.save();

        res.send(`
              <!DOCTYPE html>
            <html>
            <head>
                <title>Email Verified</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; max-width: 400px; margin: 50px auto; padding: 20px; }
                    .success { color: #28a745; font-size: 24px; margin-bottom: 20px; }
                    .message { color: #666; margin-bottom: 30px; }
                    .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
                </style>
            </head>
            <body>
                <div class="success">✓ Email Verified Successfully!</div>
                <div class="message">Your account has been verified. You can now log in to your account.</div>
                <a href="${process.env.BASE_URI || 'http://localhost:3000'}/login" class="button">Go to Login</a>
            </body>
            </html>`
        );
      }catch(error){
        console.error("Verification error:", error);
        return sendError(res, 500, "Error verifying user");
      }
};


export const login=async(req,res)=>{
    try{
        const {userName,email,password}=req.body;
        if(!password || (!email && !userName)){
            return sendError(res,400,"Please provide password and either email or username");
        }

        const user=await User.findOne({
            $or:[{email},{userName}]
        }).select('+password');

        if(!user){
            return sendError(res,404,"User not found");
        }
        console.log("LOGIN INPUT:", email, userName, password);
        console.log("FOUND USER:", user);
        console.log("DB PASSWORD:", user?.password);

        const isMatch = await user.comparePassword(password);
        console.log("PASSWORD MATCH:", isMatch);
        
        if(user.isActive==false){
            return sendError(res,404,"Account is disabled");
        }
        if(user.isLocked()){
            return sendError(res,404,"Account is locked");
        }
        const isPasswordValid=await user.comparePassword(password);
        if(!isPasswordValid){
            return sendError(res,401,"Invalid password");
        }

        const token=generateToken(user._id);
        
        user.lastLogin = new Date();
        await User.updateOne(
            { _id: user._id },
            { lastLogin: new Date() }
        );

        res.cookie("token",token,{
           httpOnly:true,
           secure: process.env.NODE_ENV === "production",
           maxAge:30*24*60*60*1000,
           sameSite: "strict"
        })

        const userResponse={
             id: user._id,
            userName: user.userName,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            verified:user.verified,
            lastLogin: new Date()
        }
        return sendSuccess(res,200,"User logged in successfully",{
            user:userResponse,
            token
        });
    }catch(error){
        console.error("login error",error);
        return sendError(res,500,"error in logging in");
    }
};


export const logout=async(req,res)=>{
    try{
        res.clearCookie("token",{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict' 
        });

        return sendSuccess(res,200,"User logged out successfully");
    }catch(error){
        console.error("Logout error:", error);
        return sendError(res, 500, "Error logging out");
    }
}

export const getUser=async(req,res)=>{
    try{
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
        if(!token){
            return sendError(res, 401, "Unauthorized - No token provided");
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        const user=await User.findById(decoded.userId).select("-password");

        if(!user){
            return sendError(res,404,"User not found");
        }
        return sendSuccess(res, 200, "User retrieved successfully", { user });

    }catch(error){
        console.error("Get user error:", error);
        if (error.name === 'JsonWebTokenError') {
            return sendError(res, 401, "Invalid token");
        }
        return sendError(res, 500, "Error fetching user");
    }
}


export const forgatPassword=async(req,res)=>{
    try{
        let {email}=req.validated.body;
        if(!email){
            return sendError(res,400,"Email is required");
        }
        if(!validateEmail(email)){
            return sendError(res,400,"Invalid email format");
        }
        email=email.trim().toLowerCase();

         if(!req.app.locals.rateLimits){
             req.app.locals.rateLimits={};
        }
        const rateLimitKey=`forget_password_${email}`;
        const lastRequest=req.app.locals.rateLimits?.[rateLimitKey];

        if(lastRequest && Date.now()-lastRequest<5*60*1000){
            return sendError(res,429,"too many password requests,please try again later.");
        }
        req.app.locals.rateLimits[rateLimitKey] = Date.now();
        
        const user=await User.findOne({email});

        if(!user){
            return sendSuccess(res,200,"If an account with this email exists, a password reset link has been sent.")
        }

        const resetToken=generateResetToken();
        const hashedToken=crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken=hashedToken;
        user.resetPasswordExpire=Date.now()+10*60*1000;
        await user.save();
        try {
             await sendPasswordResetEmail(user, resetToken);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
        
        }

         return sendSuccess(res, 200, "If an account with this email exists, a password reset link has been sent.");
    }catch(error){
        console.error("Forget password error:", error);
        return sendError(res, 500, "Error in forget password");
    }
}

export const resetPassword=async(req,res)=>{
    try{
        const {token}=req.validated.params;
        const {password,confirmPassword}=req.validated.body;

        if(!password || !confirmPassword){
            return sendError(res,400,"Password and confirm password are required");

        }
          if (password !== confirmPassword) {
            return sendError(res, 400, "Password and confirm password must match");
        }
        if(!validatePassword(password)){
             return sendError(res, 400, "Password must be at least 8 characters long one digit,one special char,one upercase,one lowercase");
        }
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        
        if (!user) {
            return sendError(res, 400, "Invalid or expired reset token");
        }
        
        user.password =password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.passwordChangedAt = Date.now();
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();
        
        return sendSuccess(res, 200, "Password reset successfully");
    }catch(error){
        console.error("Reset password error:", error);
        return sendError(res, 500, "Error resetting password");
    }
}


export const updateUser=async(req,res)=>{
    try{
        const {name,email,currentPassword,newPassword}=req.validated.body;
        const user = await User.findById(req.user.id).select('+password');
            if (!user) {
                return sendError(res, 404, "User not found");
            }
            if (name?.trim()){
                user.name = name.trim();
            }
            if (email && email !== user.email) {
                if (!validateEmail(email)) {
                    return sendError(res, 400, "Invalid email format");
                }
                
                const emailExists = await User.findOne({ email });
                if (emailExists) {
                    return sendError(res, 400, "Email already in use");
                }
                user.email = email;
                user.verified = false;
                user.verificationToken=generateToken();
            }
           
            if (currentPassword || newPassword) {
                const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
                if (!isCurrentPasswordValid) {
                    return sendError(res, 400, "Current password is incorrect");
                }
                
                if (!validatePassword(newPassword)) {
                    return sendError(res, 400, "New password must be at least 6 characters long");
                }
                const isSame = await bcrypt.compare(newPassword, user.password);
                if (isSame) {
                    return sendError(res, 400, "New password cannot be same as old password");
                }
                user.password = newPassword; 
                user.passwordChangedAt=Date.now();
            }

            if (req.file) {
                user.avatar = `/uploads/avatars/${req.file.filename}`;
            }
             await user.save();
            const userResponse = {
            id: user._id,
            userName: user.userName,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            updatedAt: user.updatedAt
        };

         return sendSuccess(res, 200, "User updated successfully", { user: userResponse });
    }catch(error){
        console.error("Update user error:", error);
        return sendError(res, 500, "Error updating user");
    }
}


export const deactivateAdmin =async(req,res)=>{
    try{
        const {id}=req.validated.params;
        const admin=await User.findById(id);
        if(!admin){
            return sendError(res,400,"admin not found");
        }
        if(admin.role!=='admin'){
            return sendError(res,400,"User is not a admin");
        }
        if(req.user._id.toString()===id){
            return sendError(res,400,"You cannot deactivate yourself");
        }
        admin.isActive=false;
        await admin.save();
        return sendSuccess(res,200,"Admin is deactivate successfully");
    }catch(error){
        return sendError(res,500,error.message);

    }
}

export const activateAdmin=async(req,res)=>{
    try{
        const{id}=req.validated.params;
        const admin=await User.findById(id);
        if(!admin){
            return sendError(res,400,"Admin not found");
        }
        
        if(admin.role!=="admin"){
            return sendError(res,400,"User is not a admin");
        }
        if(req.user._id.toString()===id){
            return sendError(res,400,"You cannot activate yourself");
        }
        admin.isActive=true;
        await admin.save();
        return sendSuccess(res,200,"admi is activated successfully");
        
    }catch(error){
         return sendError(res,500,error.message);
    }
}


