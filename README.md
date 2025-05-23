# FinTrack Pro - Personal Finance Tracker

A modern full-stack Personal Finance Tracker App using the MERN stack (MongoDB, Express.js, React, Node.js). The app allows users to add and categorize expenses and income, receive automated smart notifications, and view animated analytics and reports in a responsive and theme-adaptive interface.

## 🔥 Key Features

*   Income & Expense Tracking
*   Category Management (Predefined & Custom, Auto-tagging)
*   Visual Analytics (Bar, Line, Pie/Donut Charts)
*   Day/Night Theme (Auto-Switch & Manual Toggle)
*   Email Reports (Daily & Monthly via NodeMailer)
*   Smart Notifications (Toast & Modal, Budget Alerts)
*   Goal & Budget Planning
*   Filters & Sorting
*   User Authentication (JWT + bcrypt)
*   Responsive Design (Tailwind CSS)

## 🗂️ Tech Stack

*   **Frontend:** React, React Router, Tailwind CSS, Chart.js/Recharts, Framer Motion, Axios
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB, Mongoose
*   **Authentication:** JWT, bcrypt.js
*   **Emails:** NodeMailer
*   **Scheduling:** node-cron

## ⚙️ Setup & Installation

### Prerequisites

*   Node.js (v16 or later recommended)
*   npm or yarn
*   MongoDB (local instance or MongoDB Atlas)

### Steps

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd fintrack-pro
    ```

2.  **Create Environment File:**
    *   Copy `.env.example` to a new file named `.env` in the root directory:
        ```bash
        cp .env.example .env
        ```
    *   Update the `.env` file with your MongoDB connection string, JWT secret, email credentials, etc.

3.  **Install Server Dependencies:**
    ```bash
    cd server
    npm install
    # or
    # yarn install
    ```

4.  **Install Client Dependencies:**
    ```bash
    cd ../client
    npm install
    # or
    # yarn install
    ```

5.  **Update Client Environment (if needed):**
    *   In `client/`, copy `.env.example` (you'll create this) to `.env` and set `REACT_APP_API_URL` (or `VITE_API_URL`) if it's different from the default.

6.  **Run the Application:**

    *   **Start the Backend Server:**
        Open a terminal, navigate to the `server` directory:
        ```bash
        cd server
        npm run dev # (if you have a dev script in server/package.json) or npm start
        ```
        The server should typically run on `http://localhost:5001` (or the port you set in `.env`).

    *   **Start the Frontend Development Server:**
        Open another terminal, navigate to the `client` directory:
        ```bash
        cd client
        npm start # For Create React App
        # or
        # npm run dev # For Vite
        ```
        The client should typically run on `http://localhost:3000`.

7.  **Access the application:**
    Open your browser and go to `http://localhost:3000`.

## Scripts

*   **Server:**
    *   `npm start`: Starts the production server.
    *   `npm run dev`: Starts the development server with Nodemon (recommended for development).
*   **Client:**
    *   `npm start` (or `npm run dev` for Vite): Starts the React development server.
    *   `npm run build`: Builds the React app for production.

## Project Structure

Refer to the `FOLDER_STRUCTURE.md` (or detailed comments in the code generation) for a breakdown of the project layout.

## Contributing

[Details on how to contribute if applicable]

## License

[Specify your license, e.g., MIT]