import * as authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import env from "../config/env.js";

export const register =
  asyncHandler(async (req, res) => {
    const result =
      await authService.register({
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

    const {
      refreshToken,
      ...response
    } = result;

    res.cookie(
      env.cookie.refreshCookieName,
      refreshToken,
      {
        ...env.cookie.options,
        maxAge:
          env.cookie.refreshMaxAge,
      }
    );

    res.status(201).json({
      success: true,
      message:
        "Account created successfully",
      ...response,
    });
  });

export const login =
  asyncHandler(async (req, res) => {
    const result =
      await authService.login({
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

    const {
      refreshToken,
      ...response
    } = result;

    res.cookie(
      env.cookie.refreshCookieName,
      refreshToken,
      {
        ...env.cookie.options,
        maxAge:
          env.cookie.refreshMaxAge,
      }
    );

    res.status(200).json({
      success: true,
      message:
        "Login successful",
      ...response,
    });
  });

export const refresh =
  asyncHandler(async (req, res) => {
    const refreshToken =
      req.cookies[
        env.cookie.refreshCookieName
      ];

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message:
          "Refresh token missing",
      });
    }

    const result =
      await authService.refresh(
        refreshToken,
        req.ip,
        req.get("user-agent")
      );

    const {
      refreshToken:
        newRefreshToken,
      ...response
    } = result;

    res.cookie(
      env.cookie.refreshCookieName,
      newRefreshToken,
      {
        ...env.cookie.options,
        maxAge:
          env.cookie.refreshMaxAge,
      }
    );

    res.status(200).json({
      success: true,
      message:
        "Token refreshed",
      ...response,
    });
  });

export const logout =
  asyncHandler(async (req, res) => {
    await authService.logout(
      req.user.sessionPublicId,
      req.user.id
    );

    res.clearCookie(
      env.cookie.refreshCookieName,
      env.cookie.options
    );

    res.status(200).json({
      success: true,
      message:
        "Logged out successfully",
    });
  });

export const logoutAll =
  asyncHandler(async (req, res) => {
    const result =
      await authService.logoutAll(
        req.user.id
      );

    res.clearCookie(
      env.cookie.refreshCookieName,
      env.cookie.options
    );

    res.status(200).json({
      success: true,
      message:
        "Logged out from all devices",
      ...result,
    });
  });

export const me =
  asyncHandler(async (req, res) => {
    const user =
      await authService.getMe(
        req.user.id
      );

    res.status(200).json({
      success: true,
      data: user,
    });
  });