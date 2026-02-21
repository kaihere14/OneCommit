import axios from "axios";
import crypto from "crypto";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import User from "../models/user.routes.js";

const clientId = process.env.GITHUB_CLIENT_ID as string;
const clientSecret = process.env.GITHUB_SECRET_KEY as string;
const callbackUri = process.env.GITHUB_CALLBACK_URI as string;
const encryptionKey = process.env.ENCRYPTION_KEY as string; // 64-char hex string (32 bytes)

export const gitRedirect = async (req: Request, res: Response) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${callbackUri}&scope=user:email,repo`;
  return res.redirect(url);
};

export const createJwtToken = async (userId: string) => {
  return jwt.sign({ userId }, encryptionKey, {
    expiresIn: "15d",
  });
};

export const accessEncryption = (accessToken: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey, "hex"),
    iv
  );
  let encrypted = cipher.update(accessToken, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const accessDecryption = (encryptedAccessToken: string): string => {
  const parts = encryptedAccessToken.split(":");
  const ivHex = parts[0];
  const encrypted = parts[1];
  if (!ivHex || !encrypted) {
    throw new Error("Invalid encrypted token format");
  }
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey, "hex"),
    iv
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

export const gitCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUri,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const data = tokenRes.data;

    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${data.access_token}`,
      },
    });
    const userData: any = userRes.data;
    const user = await User.findOne({ gitHubId: userData.id });
    if (user) {
      return res.status(200).json({
        message: "User already exists",
        user,
        token: await createJwtToken(user._id.toString()),
      });
    }
    const newUser = await createUser(userData, data);
    return res.status(200).json({
      message: "User created successfully",
      user: newUser,
      token: await createJwtToken(newUser._id.toString()),
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong on server side",
    });
  }
};

const createUser = async (userData: any, data: any) => {
  const user = await User.create({
    name: userData.name,
    gitHubId: userData.id,
    accessToken: accessEncryption(data.access_token),
    commitedToday: false,
    avatarUrl: userData.avatar_url,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return user;
};

export const getUser = async (req: Request, res: Response) => {
  try {
    // const userId = req.userId;
    const userId = req;
    console.log(req);
    const user = await User.findById(userId);
    return res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong on server side" });
  }
};
