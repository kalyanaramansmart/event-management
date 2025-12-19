# Event Management System

A full-stack Event Management application built with **React**, **Flask**, and **Microsoft SQL Server**, fully containerized using **Docker Compose**.

The application is designed so that an interviewer can run the entire system with **one command**, without any manual database setup.

---

## Tech Stack

### Frontend
- React
- Axios

### Backend
- Python (Flask)
- JWT Authentication
- PyODBC

### Database
- Microsoft SQL Server 2022

### DevOps
- Docker
- Docker Compose

---

## Project Structure

```
Event_Management/
├── Backend/
├── Frontend/
├── Database/
│   └── init.sql
├── docker-compose.yml
├── Source
└── README.md
```

- **Backend/** – Flask backend application  
- **Frontend/** – React frontend application  
- **Database/** – SQL database initialization script  
- **docker-compose.yml** – Docker Compose configuration  
- **Source/** – Has Html and Css
- **README.md** – Project documentation  

---

## How to Run the Application

### Prerequisites
- Docker
- Docker Compose

No need to install Python, Node.js, or SQL Server locally.

---

### Start the application

```
docker compose up --build
```

---

## Application URLs

- Frontend: http://localhost:3000  
- Backend API: http://localhost:5000  

---

## Default Login Credentials

```
Email: interviewer@cts.com
Password: Admin@123
```

---

## Summary

A fully Dockerized React + Flask + MSSQL application that runs with a single command and requires no manual setup.


## Aplication flow

### Signup 

* User can able to create the account by using emailid password (Default role will be 'User')

### Login

* User can able to login with the account they have created (Admin creds are mentioned above)

### Calender Page

#### For Admin
* Can able to go to view all category
* Can choose category to filter
* Have a button to create new event


#### For user
* Can able to see all the events if they want thay can able to choose the category preference from the drop down
* have an checkbox to filterout the event book by him

### Event page

# Admin
* Can create/Update or delete the event

# User
* Can able to book the event or unbook if booked by other user means can see the event data


