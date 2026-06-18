import { Router } from "express";
import { Authentication, validation } from "../../Middlewares";
import userService from "./user.service";
import { successResponse } from "../../Common";
import { updatePasswordSchema, updateProfileShcema } from "../../Validators";

const router = Router();

// * get Profile
router.get("/profile", Authentication, async (req, res, next) => {
  const profile = await userService.getUserProfile(req.user);
  return successResponse({ res, data: { account: profile } });
});

// * update Profile
router.put("/update", Authentication, validation(updateProfileShcema), async (req, res, next) => {
  const updatedProfile = await userService.updateProfile(req.user, req.body);
  return successResponse({ res, message: "user Profile updated successfully", data: { account: updatedProfile } });
});

// * update password
router.patch("/update-password", Authentication, validation(updatePasswordSchema), async (req, res, next) => {
  const issuer = `${req.protocol}://${req.host}`;
  const user = await userService.updatePassword(req.body, req.user, issuer);
  return successResponse({ res, message: "your password is updated seccessfully", data: user });
});

// // * update Profile pic
// router.patch("/upload/profile-image", Authentication, multerLocal("profile/image").single("profielPictuer"), validation(updateProfileImageShcema), async (req, res, next) => {
//   const user = await userService.uploadProfilePic(req.user, req.file);
//   return successResponse({ res, message: "profile Picture Uploaded seccessfully", data: user });
// });

// // * update Cover Pic
// router.patch("/upload/profile-cover", Authentication, multerLocal("profile/cover").array("profielcover", 5), validation(uploadCoverPicSchema), async (req, res, next) => {
//   const user = await userService.uploadProfileCover(req.user, req.files);
//   return successResponse({ res, message: "profile cover Pictures is Uploaded seccessfully", data: user });
// });

// // * get Shared Profile
// router.get("/:userId/shared-profile", validation(SharedProfileSchema), async (req, res, next) => {
//   const profile = await userService.getSharedProfile(req.params.userId);
//   return successResponse({ res, data: { profile } });
// });

// // * delete Profile
// router.delete("/delete", Authentication, async (req, res, next) => {
//   await userService.deleteUserAccount(req.user);
//   successResponse({ res, message: "user Deleted" });
// });

export default router;
