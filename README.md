# Xkorin School

A secure, modern QCM platform built with Next.js 14, Prisma, MongoDB, and NextAuth.

## Features

- **Secure Exams**: Timed attempts, strict/permissive close modes, late access codes.
- **Role-based Access**: Teacher and Student dashboards.
- **Real-time Monitoring**: Teachers can track attempts and generate late codes.
- **Resume Capability**: Resume exams on any device via login or resume token.
- **Modern UI**: Built with Tailwind CSS, Framer Motion, and Lucide Icons.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Set up Environment**:
    Create a `.env` file with your MongoDB connection string:
    ```env
    DATABASE_URL="mongodb+srv://..."
    NEXTAUTH_SECRET="your-secret"
    NEXTAUTH_URL="http://localhost:3000"
    ```

3.  **Push Database Schema**:
    ```bash
    npx prisma db push
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

5.  **Access the App**:
    Open [http://localhost:3000](http://localhost:3000).

## Usage

1.  **Register** as a Teacher to create exams.
2.  **Create an Exam** with questions and options.
3.  **Register** as a Student (in incognito or another browser) to take the exam.
4.  **Monitor** progress from the Teacher Dashboard.
