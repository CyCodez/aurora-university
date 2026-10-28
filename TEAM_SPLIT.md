# Team split — Aurora University

Each member owns their pages and related JavaScript. All four members should review and test the complete user journey.

## Person 1 — Public website
Owns:
- `public/index.html`
- `public/admissions.html`
- shared layout and common styling in `public/css/style.css`
- public navigation and content

Responsibilities:
- School intro, mission, vision, logo, campus/facility photos
- Course/admissions links, FAQs, contact details, responsive layout
- Keep the shared colour palette: background `#EDF2FC`, navy `#1E3157`, blue `#2957AB`, white cards, gold accents

## Person 2 — Signup and Login
Owns:
- `public/signup.html`, `public/login.html`
- `public/js/signup.js`, `public/js/login.js`
- `/api/signup`, `/api/login`, `/api/forgot-password`, `/api/me` in `server.js`

Responsibilities:
- Validate name, email, phone, password and confirmation
- Hash passwords using bcrypt; store email in lowercase
- Handle duplicate email and incorrect login messages
- Start the session on successful login
- Explain that password recovery requires email delivery to be configured

## Person 3 — Courses and Admissions
Owns:
- `public/courses.html`, `public/apply.html`
- `public/js/courses.js`, `public/js/apply.js`
- course and application endpoints in `server.js`
- course/application data in MongoDB collections (`courses` and `applications`)

Responsibilities:
- Search/filter courses, show estimated fees, compare up to 3 courses
- Require login before application submission
- Validate form, show review, save application and display reference
- Save each application against the logged-in user's ID

## Person 4 — Dashboard and Session handling
Owns:
- `public/dashboard.html`, `public/js/dashboard.js`
- dashboard/profile/logout endpoints in `server.js`

Responsibilities:
- Require login for dashboard and application information
- Show student details, application references/statuses/fees
- Update profile and show success/error messages
- Cancel a pending application (only its owner)
- Logout and redirect
- Test direct URL access after logout

## Shared agreement
- Do not store passwords or session identity in localStorage.
- Frontend requests use the same-origin `/api/...` paths.
- Use MongoDB collection methods and keep field names consistent.
- Document IDs, collection names and field names must remain consistent.
- If editing `server.js` or `style.css`, tell the group first and merge carefully.
- Use Git branches and pull requests. Do not all push directly to `main`.
