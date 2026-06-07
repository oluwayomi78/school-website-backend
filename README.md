# School Website Backend

This is the backend API for the School Management System, built with Node.js, Express, and MongoDB.

## Features

- **User Management**: Roles for Admins, Teachers, Students, etc.
- **Academics**: Manage Classes, Courses, Curriculum, and Subjects.
- **Administration**: Attendance, Admissions, and Timetable/Schedules.
- **Facilities**: Library, Hostel, and Transport management.
- **Finance**: Payment tracking.
- **Communication**: Messages, Notifications, and Events.

## Tech Stack

- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database and ODM
- **JWT & bcrypt** - Authentication and security
- **Axios** - HTTP client requests

## Getting Started

### Prerequisites

- Node.js installed on your machine
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your environment variables (e.g., `PORT`, `MONGO_URI`, `JWT_SECRET`).

### Running the Server

Start the development server:
```bash
npm start
```

## License

ISC
