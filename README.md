# 🚀 Vybrix

**Vybrix** is an AI-powered web application that enables users to create frontend websites using natural language prompts. Users simply describe what they want, and Vybrix generates, updates, previews, and manages their projects in isolated sandbox environments.

The platform is built using a microservices architecture and leverages AI orchestration, containerized sandboxes, real-time file management, cloud storage, and scalable infrastructure to provide a seamless website-building experience.

---

## ✨ Features

* 🤖 AI-powered website generation
* ⚡ Real-time code updates and live preview
* 🔒 Isolated sandbox environments for every project
* 📁 File management APIs (Read, Create, Update, List)
* 🌐 Dynamic preview URLs
* 🔑 JWT Authentication
* 🔐 Google OAuth Login
* ☁️ AWS S3 project synchronization
* 📬 Notification system using RabbitMQ
* 🚀 Kubernetes-powered deployment and orchestration
* ⚡ Redis-based caching and pub/sub communication

---

## 🏗️ Architecture Overview

Vybrix follows a distributed microservices architecture consisting of five core services:

### 1. Authentication Service

Responsible for:

* User Registration
* User Login
* Google OAuth Authentication
* JWT Token Generation
* User Management

### 2. AI Orchestration Service

Responsible for:

* Processing user prompts
* Managing AI agents
* Tool invocation
* Code generation workflows
* Project orchestration

### 3. Sandbox Service

Responsible for:

* Creating isolated project environments
* Running Vite development servers
* Managing project files
* Serving live previews
* Executing AI-generated code safely

### 4. Notification Service

Responsible for:

* Consuming RabbitMQ events
* Sending notifications
* Managing asynchronous communication

### 5. File Synchronization Service

Responsible for:

* Synchronizing project files
* Uploading snapshots to AWS S3
* Restoring project state
* Managing project persistence

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript

### Backend

* Node.js
* Express.js

### Databases

* MongoDB Atlas

### AI

* LangChain
* LangGraph
* Mistral AI

### Infrastructure

* Docker
* Kubernetes
* NGINX Ingress Controller

### Cloud

* AWS S3

### Authentication

* JWT
* Passport.js
* Google OAuth

### Messaging & Communication

* RabbitMQ
* Redis

### DevOps

* Kubernetes Deployments
* Services
* Ingress
* Health Checks
* Readiness Probes
* Liveness Probes

---

## 🔄 Workflow

### User Flow

```text
User Prompt
    ↓
AI Orchestration Service
    ↓
AI Agent
    ↓
Sandbox APIs
    ↓
Read/Create/Update Files
    ↓
Vite Development Server
    ↓
Live Preview URL
```

### Authentication Flow

```text
User Login
    ↓
Auth Service
    ↓
JWT Generation
    ↓
RabbitMQ Event
    ↓
Notification Service
```

### Project Persistence Flow

```text
Sandbox Project
    ↓
Sync Agent
    ↓
AWS S3
    ↓
Project Backup
```

---

## 📂 Project Structure

```text
vybrix/
│
├── auth/
├── ai-orchestration/
├── notification/
├── sandbox/
│   ├── agent/
│   ├── router/
│   ├── server/
│   └── template/
│
├── k8s/
│   ├── deployments
│   ├── services
│   ├── ingress
│   └── secrets
│
└── architecture/
```

---

## 🚀 Running Locally

### Prerequisites

* Node.js
* Docker
* Kubernetes
* Skaffold
* MongoDB Atlas
* Redis
* RabbitMQ

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd vybrix
```

Install dependencies for each service.

Configure environment variables and secrets.

Run:

```bash
skaffold dev
```

This will:

* Build Docker images
* Deploy services to Kubernetes
* Configure ingress
* Start sandbox environments
* Enable live development

---

## 🔐 Environment Variables

### Authentication Service

```env
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_MONGO_URI=
```

### AI Orchestration Service

```env
MISTRALAI_API_KEY=
AI_MONGO_URI=
```

### Sandbox Service

```env
SANDBOX_MONGO_URI=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

### Redis

```env
REDIS_URL=
```

### RabbitMQ

```env
RABBITMQ_URL=
```

---

## 🎯 Key Learnings

Building Vybrix provided practical experience with:

* Microservices Architecture
* Kubernetes & Container Orchestration
* AI Agent Systems
* Distributed Communication
* Event-Driven Systems
* Cloud Storage Integration
* Authentication & Security
* Production Deployment Workflows
* Infrastructure Management
* Real-Time Development Environments

---

## 🙏 Acknowledgements

Special thanks to **Ankur Prajapati** for his continuous guidance, mentorship, and support throughout the development of this project.

This project was built as the **Final Project of Sheriyans Coding School – Cohort 2.0**.

---

## 📜 License

This project is intended for educational and portfolio purposes.

---

### ⭐ If you found this project interesting, consider giving it a star!
