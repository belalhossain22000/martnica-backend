import express from "express";
import passport from "passport";
import { SocialLoginController } from "./socialLogin.controller";


const router = express.Router();

router.get("/auth/google", SocialLoginController.googleLogin);
router.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  SocialLoginController.googleCallback
);

router.get("/auth/facebook", SocialLoginController.facebookLogin);
router.get(
  "/api/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  SocialLoginController.facebookCallback
);

export const socialLoginRoutes = router;
