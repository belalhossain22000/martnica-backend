import { Request, Response } from "express";
import passport from "../../../config/passportSetup";
import {SocialLoginService } from "./socialLogin.service";

// Initiate Google login
const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// Google callback route
const googleCallback = async (req: Request, res: Response) => {
  const token = await SocialLoginService.googleLoginIntoDb(req.user);

  res.redirect(`http://localhost:3000/?token=${token}`);
};

// Initiate Facebook login
const facebookLogin = passport.authenticate("facebook", {
  scope: ["email", "public_profile"],
});

// Facebook callback route
const facebookCallback = async (req: Request, res: Response) => {
  const token =await SocialLoginService.facebookLoginIntoDb(req.user);

  res.redirect(`http://localhost:3000/?token=${token}`);
};

export const SocialLoginController = {
  googleLogin,
  googleCallback,
  facebookLogin,
  facebookCallback,
};
