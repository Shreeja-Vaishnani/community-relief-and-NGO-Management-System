# 🌿 Community Relief & NGO Management System

A full-stack web application to manage community relief operations — coordinating donations, relief requests, and volunteer tasks across multiple user roles.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JWT + bcryptjs |

## 👥 User Roles

| Role | Permissions |
|---|---|
| **Admin** | Manage users, view all data, create/assign tasks, update statuses |
| **Donor** | Make donations, view donation history |
| **Beneficiary** | Submit relief requests, track request status |
| **Volunteer** | View & self-assign open tasks, update task progress |

## 📁 Project Structure

## 🗄️ Database Schema

- **users** — stores all users with role-based access
- **donations** — tracks donations (money, food, clothes, medicine)
- **relief_requests** — requests submitted by beneficiaries
- **volunteer_tasks** — tasks created by admin, assigned to volunteers

## 🚀 Getting Started

### Prerequisites
- Node.js
- MySQL

### 1. Clone the repository
```bash
git clone https://github.com/Shreeja-Vaishnani/community-relief-and-NGO-Management-System.git
cd community-relief-and-NGO-Management-System
