# AEGIS Campus Hub

AEGIS Campus Hub is a role-based campus management platform designed to bring essential student services into one unified web application.

The platform provides modules for grievance management, academic resources, opportunities, announcements, and role-based access for students, faculty, authorities, and administrators.

Live website: aegis-krackhack.vercel.app

---

## Overview

Campus services are often spread across multiple disconnected platforms and communication channels. AEGIS solves this by providing a centralized system where students can raise grievances, access resources, apply to opportunities, and view official announcements.

Faculty, authorities, and administrators can manage relevant modules through role-based controls.

---

## Features

### Authentication

* Email and password login
* User signup
* Password reset support
* Firebase Authentication integration
* Role-based user access

### Role-Based Access

The platform supports the following roles:

* Student
* Faculty
* Authority
* Admin

Each role has access to different features and actions.

---

## Modules

### 1. Grievance Management

Students can submit grievances and track their progress.

Features:

* Create grievances
* View grievance details
* Track grievance status
* View timeline updates
* Admin can assign grievances to authorities
* Authority/Admin can update grievance status

Supported statuses:

* submitted
* in_review
* resolved

---

### 2. Academic Resources

Faculty, authorities, and admins can share academic resources with students.

Features:

* Upload resource links
* Add course code, resource type, and description
* Browse available resources
* Access shared learning material

Resource types include:

* Notes
* Slides
* Assignment
* Lab
* Other

---

### 3. Opportunities

Faculty, authorities, and admins can post opportunities for students.

Features:

* Create opportunities
* Add description, tags, and deadline
* Students can apply to opportunities
* Posters can review applications
* Applications can be updated with status

Application statuses:

* applied
* reviewing
* accepted
* rejected

---

### 4. Announcements

Faculty, authorities, and admins can post official announcements for students.

Features:

* Create announcements
* Add tags
* Pin important announcements
* Attach optional links
* Students can view and search announcements

---

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

### Backend and Services

* Firebase Authentication
* Cloud Firestore
* Firebase Storage, optional for future file uploads

### Deployment

* Vercel

---

## Project Structure

```bash
src/
├── app/
│   ├── announcements/
│   ├── dashboard/
│   ├── grievances/
│   ├── login/
│   ├── opportunities/
│   ├── resources/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── shell/
│   │   └── AppShell.tsx
│   └── ui/
│
├── context/
│   └── AuthContext.tsx
│
└── lib/
    ├── firebase.ts
    └── utils.ts
```

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/tanishq-sonkar/aegis-krackhack.git
cd aegis-krackhack
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run the development server

```bash
npm run dev
```

Open the app at:

```bash
http://localhost:3000
```

---

## Firebase Setup

### Authentication

In Firebase Console:

1. Go to Authentication.
2. Enable Email/Password sign-in.
3. Optionally enable Google sign-in.

### Firestore

Create a Cloud Firestore database.

Main collections used by the app:

```bash
users
grievances
resources
opportunities
announcements
```

Subcollections used by the app:

```bash
grievances/{grievanceId}/updates
opportunities/{opportunityId}/applications
```

---

## Deployment

The project can be deployed using Vercel.

### Steps

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add Firebase environment variables in Vercel project settings.
4. Deploy the project.
5. Add the deployed Vercel domain to Firebase Authentication authorized domains.

Firebase Console path:

```bash
Authentication → Settings → Authorized domains
```

Add your deployed domain, for example:

```bash
your-project.vercel.app
```

---

## Testing Roles

Recommended test accounts:

| Role      | Purpose                                                                     |
| --------- | --------------------------------------------------------------------------- |
| Student   | Submit grievances, apply to opportunities, view resources and announcements |
| Faculty   | Post resources, opportunities, and announcements                            |
| Authority | Manage assigned grievances and post official content                        |
| Admin     | Assign grievances, manage roles, and access admin functions                 |

---

## Security Notes

The current implementation includes role-based checks in the frontend. For production use, Firestore Security Rules should also enforce access control.

Recommended security restrictions:

* Students can create and view their own grievances.
* Faculty, authority, and admin users can post announcements, opportunities, and resources.
* Admin users can assign grievances.
* Authority and admin users can update grievance status.
* Students can apply to opportunities.
* Application status updates should be restricted to authorized users.

---

## Future Improvements

* Google login support
* File upload support using Firebase Storage
* Notification system for grievance and application updates
* Admin analytics dashboard
* Stronger Firestore Security Rules
* Email notifications
* Advanced filtering and search

---

## Author

Tanishq Sonkar

GitHub: [@tanishq-sonkar](https://github.com/tanishq-sonkar)

---

## License

This project is intended for educational and hackathon use.
