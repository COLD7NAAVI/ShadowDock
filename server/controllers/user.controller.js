import * as userService from "../services/user.service.js";

export async function me(
  req,
  res,
  next
) {
  try {
    const user =
      await userService.getMyProfile(
        req.user.id
      );

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(
  req,
  res,
  next
) {
  try {
    const user =
      await userService.editProfile(
        req.user.id,
        req.body
      );

    res.json({
      success: true,
      message:
        "Profile updated successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function profile(
  req,
  res,
  next
) {
  try {
    const user =
      await userService.getProfile(
        req.params.publicId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function search(
  req,
  res,
  next
) {
  try {
    const users =
      await userService.findUsers(
        req.query.q || ""
      );

    res.json({
      success: true,
      users,
    });
  } catch (err) {
    next(err);
  }
}