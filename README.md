# Aurora University Website

Aurora University is a responsive university website built with HTML, CSS, JavaScript, Node.js, Express and MongoDB. The site includes programme discovery, account registration and login, a student dashboard, profile management and admission application tracking.

## Requirements

- Node.js (LTS recommended)
- MongoDB Community Server, or a MongoDB Atlas connection string
- A terminal such as the VS Code integrated terminal

## Setup

1. Start MongoDB locally or create a MongoDB Atlas cluster.
2. Open a terminal in this project folder and install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to a new file named `.env`.
4. Set `MONGODB_URI` to your local MongoDB address or Atlas connection string. Set a private value for `SESSION_SECRET`.
5. Start the application:

   ```bash
   npm start
   ```

6. Open `http://localhost:3000` in your browser.

The server connects to the database named in `DB_NAME`, creates the required collections and ensures that all 16 programmes are available in the course catalogue. Existing course records are updated only when their IDs are already present; they are not duplicated on subsequent starts.

## Environment settings

```env
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=aurora_university
SESSION_SECRET=replace_with_a_long_random_secret
PORT=3000
```

Do not upload `.env` or database credentials to GitHub.

## Features

- Responsive homepage with university information and campus facilities
- Catalogue of 16 undergraduate programmes across multiple departments
- Course search, department filtering, fee display and comparison
- Account registration with validation and hashed passwords
- Login and session-based authentication
- Protected student dashboard and profile updates
- Admission application submission, reference codes, status history and cancellation of submitted applications
- Password-recovery guidance when email delivery is not configured

## Team collaboration

See `TEAM_SPLIT.md` for the suggested division of responsibilities across four team members.

## Testing

Use `TESTING_CHECKLIST.md` to check registration, login, course search, admission applications, dashboard, profile updates and logout.

## Notes

- Password recovery currently displays guidance but does not send email. An email provider must be configured to enable that workflow.
- Before deploying for public use, configure HTTPS, a strong session secret, production cookie settings, rate limiting, email verification, logging, privacy safeguards and an appropriate admissions review process.
- Campus photography is loaded from remote image URLs and requires an internet connection. The Aurora logo is stored locally in `public/images/`.
