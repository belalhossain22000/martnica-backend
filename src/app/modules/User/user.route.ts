import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// *!register user
router.post(
  "/register",
  validateRequest(UserValidation.CreateUserValidationSchema),
  userController.createUser
);
// *!get all  user
router.get("/", userController.getUsers);

// *!profile user update
router.put(
  "/profile",
  auth(),
  userController.updateProfile
);

// *!update  user by admin using id
router.put("/:id",userController.updateUser);

export const userRoutes = router;
