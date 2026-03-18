# School Management App - Backend

Welcome to the backend component of the School Management Application. This project is a robust API built with Node.js and Express, designed to manage students, parents, classes, grades, and more.

## 🚀 Technologies

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Security**: [Helmet](https://helmetjs.github.io/), [CORS](https://github.com/expressjs/cors)
- **Utilities**: 
  - [Puppeteer](https://pptr.dev/) (PDF generation)
  - [ExcelJS](https://github.com/exceljs/exceljs) (Excel reports)
  - [ical-generator](https://github.com/sebbo2002/ical-generator) (Calendar management)
  - [Morgan](https://github.com/expressjs/morgan) (HTTP logging)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas instance)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## 🛠️ Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configuration**:
   Copy the `.env.example` file to `.env` and update the variables:
   ```bash
   cp .env.example .env
   ```
   Required variables:
   - `PORT`: Server port (default: 5000)
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret key for token signing
   - `JWT_EXPIRE`: Token expiration time (e.g., 30d)

3. **Database Seeding (Optional)**:
   If you have seed scripts, run them using:
   ```bash
   node seed_admin.js
   # or
   node create_test_data.js
   ```

## 🏃 Scripts

- `npm start`: Start the production server.
- `npm run dev`: Start the development server with `nodemon` for auto-restart.

## 📂 Project Structure

```
Backend/
├── config/         # Database and global configurations
├── controllers/    # Request handlers
├── middleware/     # Custom Express middleware (auth, error handling)
├── models/         # Mongoose schemas
├── routes/         # API endpoint definitions
├── scripts/        # Utility scripts (seeding, etc.)
├── utils/          # Helper functions
├── uploads/        # Static file storage (bulletins, etc.)
└── server.js       # Main entry point
```

## 🛠️ API Modules & Endpoints

All endpoints are prefixed with `/api/v1`.

| Module | Base Path | Description |
| :--- | :--- | :--- |
| **Auth** | `/auth` | Login, Register, Logout |
| **Users** | `/users` | User management |
| **Classes** | `/classes` | Academic classes management |
| **Students** | `/eleves` | Student profiles and records |
| **Parents** | `/parents` | Parent/Guardian management |
| **Grades** | `/grades` | Grade and score management |
| **Bulletins** | `/bulletins` | Report card generation and workflow |
| **Attendance** | `/attendance` | Student attendance tracking |
| **Calendar** | `/calendar` | School events and scheduling |
| **Messaging** | `/messages` | Internal communication system |
| **Stats** | `/stats` | Dashboard analytics and reports |

## 📦 Deployment

The project includes a `Dockerfile` for containerized deployment.
To build the image:
```bash
docker build -t school-management-backend .
```

## 📝 License

This project is licensed under the **ISC License**.
