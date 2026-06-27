import {Router} from "express";
import User from "../models/user.model.js";
import passport from "passport";
import { sendAuthNotification } from "../config/mq.js";
import jwt from 'jsonwebtoken';
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();


router.get("/google", passport.authenticate("google", { 
    session: false,
    scope: ["profile", "email"] 
}));

router.get("/google/callback", passport.authenticate("google", { 
    session: false,
    failureRedirect: "/login" 
}), async (req, res) => {
    try{
        const { id, displayName, emails, photos } = req.user;
        let user = await User.findOne({ googleId: id });


        if(!user){
            user = await User.create({
                googleId: id,
                email: emails[0].value, 
                name: displayName,
                avatar: photos[0].value
            });
            await user.save();
        }

        await sendAuthNotification({
            userId: user._id,
            action: 'google_login',
            timestamp: new Date(),
            email: emails[0].value
        })

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, { httpOnly: true });
        res.redirect("http://localhost:5173");
    }catch(error){
        console.error("Error during Google authentication:", error);
        res.redirect("/");
    }
    
});

router.get("/getMe", authMiddleware, async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});



export default router;