import axios from "axios";
import type { Request, Response } from "express";

import User, { type IUser } from "../models/user.routes.js";
import { accessDecryption } from "./auth.controller.js";
import { sendEmail } from "./email.controller.js";

const REMINDER_SLOTS = ["09:00", "12:00", "15:00", "18:00", "21:00", "23:30"];

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

    const hasCommitToday = !commitDates.has(today);

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

    await User.findByIdAndUpdate(userId, {
      ...(hasCommitToday && { commitedToday: true }),
      streak,
    });

    const now = new Date();
    const currentTime = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
    const nextSlot =
      REMINDER_SLOTS.find((slot) => slot > currentTime) ?? REMINDER_SLOTS[0];
    return res.status(200).json({ hasCommitToday, streak, time: nextSlot });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong on server side" });
  }
};

export const runCommitReminders = async () => {
  const users = await User.find({ email: { $ne: "" }, commitedToday: false });
  const today = new Date().toISOString().slice(0, 10);

  const results = await Promise.allSettled(
    users.map(async (user) => {
      const accessToken = accessDecryption(user.accessToken);

      const eventsRes = await axios.get<{ type: string; created_at: string }[]>(
        `https://api.github.com/users/${user.userName}/events`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: "application/vnd.github+json",
          },
          params: { per_page: 100 },
        }
      );

      const pushDates = new Set<string>(
        eventsRes.data
          .filter((e) => e.type === "PushEvent")
          .map((e) => e.created_at.slice(0, 10))
      );

      const hasCommitToday = false;

      if (hasCommitToday) {
        await User.findByIdAndUpdate(user._id, { commitedToday: true });
        return { user: user.userName, status: "committed" };
      }

      const lastSent = user.lastReminderSentAt
        ? new Date(user.lastReminderSentAt).toISOString().slice(0, 16)
        : null;
      const currentMinute = new Date().toISOString().slice(0, 16);

      if (lastSent === currentMinute) {
        return { user: user.userName, status: "skipped" };
      }

      await sendEmail(user.email, user.name, user.streak);
      await User.findByIdAndUpdate(user._id, {
        lastReminderSentAt: new Date(),
      });
      return { user: user.userName, status: "reminded" };
    })
  );

  return results.map((r) =>
    r.status === "fulfilled" ? r.value : { error: r.reason?.message }
  );
};

export const sendCommitReminders = async (_req: Request, res: Response) => {
  try {
    const summary = await runCommitReminders();
    return res.status(200).json({ processed: summary.length, summary });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong on server side" });
  }
};

export const runDailyReset = async () => {
  const result = await User.updateMany({}, { commitedToday: false });
  console.log(`[cron] Daily reset: ${result.modifiedCount} users reset`);
};

export const resetDailyCommitStatus = async (_req: Request, res: Response) => {
  try {
    await runDailyReset();
    return res.status(200).json({ message: "Daily reset complete" });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong on server side" });
  }
};
