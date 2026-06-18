import "dotenv/config";
import express from "express";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import passport from "passport";
import cookieParser from "cookie-parser";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(cookieParser());
app.use(passport.initialize());
app.use("/api/auth", authRoutes);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      // Handle user authentication logic here
      return done(null, profile);
    }
  )
);

app.get('/_status/healthz', (req, res) => {
    res.status(200).json({ status: 'ok' });
});   

app.get('/_status/readyz', (req, res) => {
    res.status(200).json({ status: 'ready' });
});   

export default app;