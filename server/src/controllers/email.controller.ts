import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_KEY);

const buildEmailHtml = (name: string, streak: number): string => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background-color:#0d1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d1117;padding:48px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

            <!-- Brand -->
            <tr>
              <td style="padding-bottom:24px;text-align:center;">
                <span style="font-size:16px;font-weight:600;color:#e6edf3;letter-spacing:-0.2px;">OneCommit</span>
              </td>
            </tr>

            <!-- Card -->
            <tr>
              <td style="background-color:#161b22;border:1px solid #30363d;border-radius:14px;overflow:hidden;">

                <!-- Top accent bar -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="height:3px;background:linear-gradient(90deg,#fb923c 0%,#f97316 100%);font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                </table>

                <!-- Card body -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:40px 36px 36px;">

                      <!-- Icon -->
                      <table cellpadding="0" cellspacing="0" align="center" style="margin-bottom:20px;">
                        <tr>
                          <td width="56" height="56" style="width:56px;height:56px;border-radius:50%;background:rgba(251,146,60,0.1);border:1.5px solid rgba(251,146,60,0.28);text-align:center;vertical-align:middle;font-size:22px;">
                            &#9888;&#65039;
                          </td>
                        </tr>
                      </table>

                      <!-- Heading -->
                      <p style="margin:0 0 10px;font-size:21px;font-weight:600;color:#e6edf3;text-align:center;letter-spacing:-0.4px;">
                        No commit today, ${name}
                      </p>

                      <!-- Streak pill -->
                      <table cellpadding="0" cellspacing="0" align="center" style="margin-bottom:32px;">
                        <tr>
                          <td style="background:rgba(251,146,60,0.08);border:1px solid rgba(251,146,60,0.22);border-radius:20px;padding:5px 16px;">
                            <span style="font-size:13px;color:#fb923c;font-weight:500;">&#128293; ${streak}-day streak at risk</span>
                          </td>
                        </tr>
                      </table>

                      <!-- Divider -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                        <tr>
                          <td style="height:1px;background:#21262d;font-size:0;line-height:0;">&nbsp;</td>
                        </tr>
                      </table>

                      <!-- Body copy -->
                      <p style="margin:0 0 32px;font-size:14px;color:#8b949e;line-height:1.75;text-align:center;">
                        You haven't pushed a commit yet today. Don't let the streak die —<br />
                        even a one-line update keeps it alive. Push before midnight.
                      </p>

                      <!-- CTA -->
                      <table cellpadding="0" cellspacing="0" align="center">
                        <tr>
                          <td style="background-color:#197fe6;border-radius:9px;">
                            <a href="https://github.com" style="display:inline-block;padding:13px 30px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.1px;">
                              Push a commit now &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>
                </table>

                <!-- Card footer strip -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:16px 36px;border-top:1px solid #21262d;background-color:#0d1117;">
                      <p style="margin:0;font-size:12px;color:#484f58;line-height:1.6;text-align:center;">
                        Sent by OneCommit &middot; commit streak tracker
                      </p>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Page footer -->
            <tr>
              <td style="padding:28px 0 0;text-align:center;">
                <p style="margin:0;font-size:12px;color:#484f58;line-height:1.8;">
                  You're receiving this because you enabled commit reminders.<br />
                  <a href="#" style="color:#6e7681;text-decoration:underline;">Unsubscribe</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const sendEmail = async (
  email: string,
  name: string,
  streak: number
) => {
  const { data, error } = await resend.emails.send({
    from: "OneCommit <noreply@armandev.space>",
    to: [email],
    subject: `⚠️ Your ${streak}-day streak is at risk — commit before midnight`,
    html: buildEmailHtml(name, streak),
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
};
