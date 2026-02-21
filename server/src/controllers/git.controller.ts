import axios from "axios";
import type { Request, Response } from "express";

import User, { type IUser } from "../models/user.routes.js";
import { accessDecryption } from "./auth.controller.js";

export const checkCommit = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const user: IUser = (await User.findById(userId)) as IUser;
    const access_token = accessDecryption(user.accessToken);

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const from = new Date();
    from.setFullYear(from.getFullYear() - 1);

    const gqlResponse = await axios.post(
      "https://api.github.com/graphql",
      {
        query: `
          query($username: String!, $from: DateTime!, $to: DateTime!) {
            user(login: $username) {
              contributionsCollection(from: $from, to: $to) {
                contributionCalendar {
                  weeks {
                    contributionDays {
                      date
                      contributionCount
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          username: user.userName,
          from: from.toISOString(),
          to: new Date().toISOString(),
        },
      },
      {
        headers: {
          Authorization: `bearer ${access_token}`,
        },
      }
    );

    const weeks = gqlResponse.data.data.user.contributionsCollection
      .contributionCalendar.weeks as any[];

    const commitDates = new Set<string>();
    for (const week of weeks) {
      for (const day of week.contributionDays as any[]) {
        if (day.contributionCount > 0) {
          commitDates.add(day.date as string);
        }
      }
    }

    const hasCommitToday = commitDates.has(today);

    if (hasCommitToday) {
      await User.findByIdAndUpdate(userId, { commitedToday: true });
    }

    let streak = 0;
    const date = new Date();
    while (true) {
      const dateStr = date.toISOString().slice(0, 10);
      if (commitDates.has(dateStr)) {
        streak++;
        date.setUTCDate(date.getUTCDate() - 1);
      } else {
        break;
      }
    }
    const allReminderSlots = [
      "09:00",
      "12:00",
      "15:00",
      "18:00",
      "21:00",
      "23:30",
    ];

    const currentTime = new Date().toISOString().slice(11, 16);
    const time = allReminderSlots.find((slot) => slot > currentTime);
    return res.status(200).json({ hasCommitToday, streak, time });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong on server side" });
  }
};
