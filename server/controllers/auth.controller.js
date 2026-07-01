import * as authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import env from "../config/env.js";

export const register =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const user =
        await authService.register(
          req.body
        );

      res.status(201).json({
        success: true,
        message:
          "Account created",
        user,
      });
    }
  );

export const login =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const result =
        await authService.login(
          req.body
        );

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
            env.cookie
              .refreshMaxAge,
        }
      );

      res.json({
        success: true,
        message:
          "Login successful",
        ...response,
      });
    }
  );

export const refresh =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const refreshToken =
        req.cookies[
          env.cookie
            .refreshCookieName
        ];

      if (
        !refreshToken
      ) {
        return res
          .status(401)
          .json({
            success:
              false,
            message:
              "Refresh token missing",
          });
      }

      const result =
        await authService.refresh(
          refreshToken
        );

      res.json({
        success: true,
        message:
          "Token refreshed",
        ...result,
      });
    }
  );

export const logout =
  asyncHandler(
    async (
      req,
      res
    ) => {
      await authService.logout(
        req.user.id
      );

      res.clearCookie(
        env.cookie
          .refreshCookieName,
        env.cookie.options
      );

      res.json({
        success: true,
        message:
          "Logged out",
      });
    }
  );

export const me =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const user =
        await authService.getMe(
          req.user.id
        );

      res.json({
        success: true,
        user,
      });
    }
  );