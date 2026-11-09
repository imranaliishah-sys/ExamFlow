# ExamFlow – Online Examination System

ExamFlow is a MERN Stack-based Online Examination System designed to manage online exams for educational institutions. It provides separate portals for Admin, Teachers, and Students.

## Project Overview

The system aims to make examination management easier through online exam creation, student participation, automatic evaluation, and result management.

## Technology Stack

- **Frontend:** React.js, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT
- **API Communication:** Axios

## User Roles

### Admin
- Manage system users and accounts.
- Monitor teachers, students, exams, and results.

### Teacher
- Manage subjects and classes/courses.
- Create and manage examinations.
- Add and manage exam questions.
- Publish and unpublish exams.
- Review student attempts and results.
- Evaluate written answers.

### Student
- Register and log in.
- View available examinations.
- Attempt exams.
- Submit answers.
- View examination results and history.

## Main Features

- Role-based authentication.
- Separate Admin, Teacher, and Student dashboards.
- Subject and examination management.
- Multiple question types: MCQ, Short and Long.
- Timed examinations.
- Automatic evaluation of MCQs.
- Manual evaluation of written answers.
- Student results and examination history.

*Note: Features are under development and may change as the project progresses.*

## Project Structure

```text
online-examination-system/
│
├── client/                 # React frontend
│
├── server/                 # Node.js and Express backend
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd online-examination-system
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

Configure your backend environment variables in a `.env` file. Add your MongoDB connection string, JWT secret, and other required settings according to the backend configuration.

Start the backend:

```bash
npm run dev
```

### 3. Install Frontend Dependencies

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Environment Variables

Keep your private configuration in `.env` files. Never upload database passwords, JWT secrets, or other credentials to GitHub.

## Database

ExamFlow uses MongoDB. A MongoDB Atlas connection can be configured through the backend environment variables.

## Project Status

**Development in Progress**

This project is being developed as a full-stack online examination management system.

## Developer

**Imran Ali Shah**

## License

This project is currently intended for educational and learning purposes.