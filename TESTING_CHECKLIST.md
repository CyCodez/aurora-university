# Testing Checklist

## Setup

- [ ] MongoDB is running and the application can connect to it.
- [ ] `.env` contains the correct MongoDB connection string and database name.
- [ ] The 16 programmes appear in the course catalogue after startup.
- [ ] `npm install` completes successfully.
- [ ] `npm start` starts the server at `http://localhost:3000`.

## Signup

- [ ] Empty fields show a useful message.
- [ ] Invalid email and phone values are rejected.
- [ ] Passwords under eight characters are rejected.
- [ ] Passwords missing uppercase, lowercase, number or special character are rejected.
- [ ] Password confirmation is required and must match.
- [ ] Duplicate email is rejected regardless of letter case.
- [ ] Successful signup clears the fields and opens the login page.

## Login and sessions

- [ ] Unknown email and incorrect password are rejected.
- [ ] Successful login opens the dashboard.
- [ ] Opening the dashboard or application page while logged out redirects to login.
- [ ] Refreshing the dashboard keeps the session active.
- [ ] Logout ends the session.
- [ ] Opening the dashboard after logout redirects to login.

## Courses and applications

- [ ] All 16 courses load from MongoDB.
- [ ] Course search and department filtering work.
- [ ] Course comparison displays selected programmes and fees.
- [ ] Application form requires login.
- [ ] Invalid age, email, course or personal statement is rejected.
- [ ] Application review is shown before submission.
- [ ] Successful submission displays a reference code.
- [ ] Application appears in the dashboard with status and estimated fee.
- [ ] A submitted application can be cancelled by its owner.

## Profile and responsive layout

- [ ] Profile updates remain saved after refresh.
- [ ] Check the homepage, courses, signup, login, admissions, application and dashboard on mobile widths.
- [ ] Verify logo, photos, links, error messages and logout.
