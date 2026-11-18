# Library Stock Manager

React + Express + MySQL app for managing books, stock levels, borrowing transactions and users.

## Setup

### 1. Database
```sql
CREATE DATABASE library_db;
```
Tables are created automatically when the backend first starts (see `backend/schema.sql`).

### 2. Backend
```bash
cd backend
cp .env.example .env     # then put your MySQL password in .env
npm install
npm run dev
```
API runs on http://localhost:5000. On first start a default admin is created:
**ADMIN001 / admin123** (change the password after logging in).

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173.

## API

| Method | Route | Purpose |
|---|---|---|
| POST | /auth/login | Log in with membership ID + password |
| GET/POST | /books | List / add a book (initial quantity is logged as a RESTOCK) |
| GET/PUT/DELETE | /books/:id | Read / update details / delete |
| GET/POST | /transactions | History (filter with ?book_id= &user_id=) / record RESTOCK, BORROW, RETURN |
| GET/PUT/DELETE | /transactions/:id | Read / edit note / undo (reverses stock) |
| GET/POST | /users | List / add a user |
| GET/PUT/DELETE | /users/:id | Read / update / delete |

## Design notes
- Stock is only changed through transactions, inside a database transaction with a row lock, so quantity can never go below zero and history always matches stock.
- Passwords are hashed with bcrypt and never returned by the API.
- Low stock = fewer than 2 copies (`LOW_STOCK_LIMIT` in `StockBadge.jsx`).
- Known limitation: login state lives in the browser only (no JWT), so the API itself is not role-protected.
