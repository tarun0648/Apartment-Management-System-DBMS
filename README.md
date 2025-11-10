# Apartment Management System  DBMS Mini-Project

This is a comprehensive, multi-user web application designed to digitize and streamline the management of a residential apartment complex. It is built as a full-stack application with a React.js frontend, a Node.js/Express.js backend, and a MySQL database.

The system provides separate, role-based dashboards and functionalities for different users:
* **Administrators:** Have full oversight and management capabilities.
* **Owners:** Can manage their property, view complaints, and access services.
* **Tenants:** Can view their rental details, raise complaints, and access services.
* **Employees:** Can view their job-related information, such as salary.

---

## 🚀 Features

### Administrator
* **Dashboard:** View aggregate data, including total counts of owners, tenants, and employees.
* **User Management:** Create new owners, tenants, and employees.
* **View Details:** View complete lists and details for all owners, tenants, and rooms.
* **Complaint Management:** View and manage all complaints submitted by residents.
* **Visitor Approval:** Manage and approve/reject pending visitor requests (as implied by the schema).
* **Financials:** Manage lease agreements and maintenance records.

### Owner
* **Dashboard:** View a personalized dashboard.
* **Complaint Management:** Raise new complaints and view the status of previously submitted complaints.
* **Resource Management:** View and update their assigned parking slot.
* **Visitor Management:** Request entry for new visitors.
* **Community:** View community amenities, events, and service providers.

### Tenant
* **Dashboard:** View personal and rental details.
* **Complaint Management:** Raise new complaints.
* **Visitor Management:** Request entry for new visitors.
* **Community:** View community amenities, events, and service providers.
* **Feedback:** Submit feedback to the administration.

### Employee
* **Dashboard:** View personal employment details, such as salary.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, React Router, Axios, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MySQL

---

## 🗃️ Database Schema

The project uses a relational MySQL database with **17 tables** to manage all aspects of the apartment complex.

**Key Entities Include:**
* `block`, `room`: Manages the physical structure of the complex.
* `auth`, `block_admin`, `owner`, `tenant`, `employee`: Manages all user roles and authentication.
* `complaints`, `maintenance`, `visitors`, `lease_agreements`: Manages the day-to-day operations and finances.
* `community_events`, `amenities`, `service_providers`, `feedback`: Manages community engagement.

The full **ER Diagram** and **Relational Schema** are available in the `/assets` directory.

### Advanced SQL Features
The database backend leverages advanced SQL features for efficiency, automation, and data integrity:
* **Stored Procedures:** Used for complex, multi-join reports like `GetExpiringLeases()`, `GetPendingVisitorRequests()`, and `GetCurrentVisitorsInside()`.
* **Triggers:** Used to automate business logic, such as the `after_lease_insert` trigger (which syncs the `rental` table) and the `after_visitor_approval` trigger (which manages the visitor workflow).
* **Views:** Used to create virtual tables for simplified querying, like `active_leases_view` and `visitor_approval_stats`.
* **Functions:** Used for reusable calculations like `GetTotalLeaseValue()` and `GetApartmentVisitorCount()`.

---

## 📦 Installation & Setup

To get this project up and running locally, follow these steps.

### Prerequisites
* [Node.js](https://nodejs.org/) (which includes npm)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/) (e.g., MySQL Community Server or XAMPP)

### 1. Database Setup
1.  Open your MySQL database management tool (like MySQL Workbench or phpMyAdmin).
2.  Create a new database named `apartment_management`.
    ```sql
    CREATE DATABASE apartment_management;
    ```
3.  Use the new database.
    ```sql
    USE apartment_management;
    ```
4.  Import the complete database schema by executing the SQL commands in `database/full_updated.sql`.
5.  Import the advanced features (Views, Triggers, Procedures, Functions) by executing the SQL commands in `database/views.sql`.

### 2. Backend Setup (Server)
1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Update the database configuration in `server/config_sql.js` with your MySQL username and password:
    ```javascript
    const config = {
        host: "localhost",
        uname: "your_mysql_username", // Replace this
        upass: "your_mysql_password", // Replace this
        database: "apartment_management"
    };
    module.exports = config;
    ```
3.  Install the required npm packages:
    ```bash
    npm install mysql2
    npm install --legacy-peer-deps
    ```
4.  Start the backend server (it will run on `http://localhost:3001`):
    ```bash
    npm start
    ```
    (This uses `nodemon` for auto-reloading).

### 3. Frontend Setup (Client)
1.  Open a **new terminal** and navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install the required npm packages:
    ```bash
    npm install
    ```
3.  Start the React development server (it will open in your browser at `http://localhost:3000`):
    ```bash
    npm start
    ```

You can now access the application in your browser.

---



npm install mysql2

npm install --legacy-peer-deps

npm run start
