import express, { Application, Request, Response } from "express";
import httpStatus from "http-status";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import prisma from "./shared/prisma";

dotenv.config();

const app: Application = express();

export const corsOptions = {
  origin: ["http://localhost:3001", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Session setup for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// Passport Facebook OAuth setup
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
      profileFields: ["id", "displayName", "email", "photos"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Route to initiate Google login
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback route
app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req: Request, res: Response) => {
    // Generate JWT after successful login
    const token = jwt.sign(
      {
        name: req.user.displayName,
        email: req.user.emails?.[0]?.value,
        photo: req.user.photos?.[0]?.value,
      },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" }
    );
    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/?token=${token}`);
  }
);

// Route for initiating Facebook OAuth
app.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email","public_profile"] })
);


// Facebook OAuth callback route
app.get(
  "/api/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  (req, res) => {
  
    const token = jwt.sign(
      {
        displayName: req.user.displayName,
        email: req.user.emails ? req.user.emails[0].value : "", // Facebook may not always provide email
        photo: req.user.photos ? req.user.photos[0].value : "",
      },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" }
    );
    res.redirect(`http://localhost:3000/?token=${token}`);
    // res.send(token);
  }
);

// Route handler for root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Martnica Server is Running",
  });
});

// API routes
app.use("/api/v1", router);

// Global error handling
app.use(GlobalErrorHandler);

// Not found handler
app.use((req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
