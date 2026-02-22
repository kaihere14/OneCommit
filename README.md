# OneCommit ⚡️

OneCommit is a smart tool designed to help developers maintain their GitHub commit streaks. It monitors your daily GitHub activity and, if you haven't pushed a commit by a certain time, sends you beautiful email reminders encouraging you to make a small contribution before midnight.

This project consists of two main parts:

- **Client (`/client`)**: A Chrome Extension that users can install to connect their GitHub accounts and configure reminder preferences.
- **Server (`/server`)**: A Node.js API that handles GitHub OAuth, securely stores user data in MongoDB, schedules reminders via an external cloud cron job, and sends beautiful dark-mode compatible emails using Resend.

---

## 🏗 Architecture

### 1. Client (Chrome Extension)

Located in the `client/` directory, this extension uses Manifest V3. It allows users to:

- See their current streak and whether they've committed today.
- Log in to sync their GitHub account with the OneCommit backend.

### 2. Server (Node.js + Express)

Located in the `server/` directory.

- **Database**: MongoDB (via Mongoose) to store user data (streaks, last reminder sent, tokens).
- **Authentication**: GitHub OAuth 2.0. Access tokens are encrypted using AES-256 before being stored in the database.
- **Emails**: Sent using [Resend](https://resend.com), delivering beautifully formatted HTML emails that support both light and dark mode securely out of the box.
- **Jobs**: Exposes API endpoints designed to be triggered by an external Cloud Cron provider (like GitHub Actions, Vercel Cron, or Cron-job.org).

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB connection string
- GitHub OAuth App (for Client ID and Secret)
- Resend API Key

### Server Setup

1. Navigate to the `server/` directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `server/` root based on the following variables:

   ```env
   # Server Config
   PORT=3000

   # MongoDB
   MONGODB_URI=mongodb+srv://<your-cluster-url>

   # Security / Encryption
   ENCRYPTION_KEY=your_64_character_hex_string_here # 32-byte hex for AES-256 encryption

   # GitHub OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_SECRET_KEY=your_github_client_secret
   GITHUB_CALLBACK_URI=http://localhost:3000/api/v1/auth/github/callback

   # Resend Alerts
   RESEND_KEY=re_YourResendApiKeyHere
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Chrome Extension Setup

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** at the top right.
3. Click **Load unpacked** and select the `/client` directory.
4. The OneCommit extension will now appear in your toolbar.

---

## ⏰ Cron Jobs

The server API is completely stateless for job scheduling. It relies on external HTTP requests to trigger its routines. Set up your external Cron provider to ping these endpoints:

### 1. Check & Send Email Reminders

**`POST {YOUR_BACKEND_URL}/api/v1/git/remind`**

- **Frequency**: Every few hours (e.g., 09:00, 12:00, 15:00, 18:00, 21:00, 23:30).
- **What it does**: Fetches the GitHub event stream for users lacking a commit today. If a commit is found, their status is updated. If no commit is found, an email reminder is sent (throttled to avoid spamming).

### 2. Daily Database Reset

**`POST {YOUR_BACKEND_URL}/api/v1/git/reset-day`**

- **Frequency**: Once a day at exactly Midnight (`0 0 * * *`).
- **What it does**: Resets the `commitedToday` status to `false` for all users in the database, prepping them for the new day.

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express, TypeScript, Mongoose
- **Frontend / Extension**: HTML, CSS, JavaScript, Chrome Extension APIs
- **Emails**: Resend integration targeting GitHub-style UI schemas
- **Formatting**: Default Prettier + Husky (`.lintstagedrc`) formatting hook config

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

ISC License
