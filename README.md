# Smart Complaint Management System

## Overview

The Smart Complaint Management System is a full-stack web application that allows users to report, track, and manage complaints through a centralized digital platform.

Users can register, log in, submit complaints with images, and view complaint status updates. Operators can manage complaints, update statuses, and remove resolved or invalid reports.

---

## Features

### User Features

* User Registration
* User Login
* JWT Authentication
* Create Complaints
* Upload Complaint Images
* View Complaints
* Search Complaints

### Operator Features

* View All Complaints
* Update Complaint Status
* Delete Complaints

### System Features

* PostgreSQL Database Integration
* Role-Based Access Control (RBAC)
* Secure Password Hashing
* JWT Token Authentication
* Responsive Frontend
* Image Upload Support

---

## Tech Stack

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL

### Authentication

* JWT (JSON Web Tokens)
* Passlib (Bcrypt)

### Version Control

* Git
* GitHub

---

## Project Structure

```text
smart-complaint-system/
│
├── backend/
│   ├── app/
│   │   ├── database/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── uploads/
│   └── requirements.txt
│
└── frontend/
    └── civic-insight-30-main/
```

## API Endpoints

### Authentication

```http
POST /register
POST /login
```

### Complaints

```http
POST /complaints
GET /complaints
PUT /complaints/{id}
DELETE /complaints/{id}
```

## Authentication & Authorization

The system uses JWT-based authentication.

### User Permissions

* Register
* Login
* Create Complaints
* View Complaints

### Operator Permissions

* View Complaints
* Update Complaint Status
* Delete Complaints

---

## Complaint Status Workflow

```text
Pending
   ↓
In Progress
   ↓
Resolved
```

---

## Database

PostgreSQL is used as the primary database.

Main tables:

* Users
* Complaints

---

## Installation

### Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

### Frontend

```bash
cd frontend/civic-insight-30-main

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:8080
```

---

## Testing

Successfully tested:

* User Registration
* User Login
* JWT Authentication
* Complaint Creation
* Complaint Retrieval
* Complaint Status Updates
* Complaint Deletion
* Image Upload
* Search Functionality
* Role-Based Access Control
* Mobile Responsiveness

---

## Future Enhancements

* Docker Containerization
* Docker Compose
* CI/CD Pipeline
* Cloud Deployment
* Email Notifications
* AI-Based Complaint Classification
* Analytics Dashboard

---

## Author

Abhijith P M
