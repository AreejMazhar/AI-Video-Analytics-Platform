# Invexal AI Video Analytics Platform

A scalable, enterprise-grade AI-powered video analytics platform with modular computer vision models, real-time dashboards, and a database-aware AI chatbot.

## 🚀 Overview

This platform allows administrators to manage multiple camera streams and dynamically enable or disable AI detection models based on operational requirements. It delivers real-time analytics, intelligent alerting, historical reporting, and a natural-language AI chatbot for querying system data — mirroring the architecture of enterprise-grade video intelligence products used across industrial, retail, and security domains.

## ✨ Features

### Core Modules
- **Authentication & User Management** - Secure login, role-based access control (Admin, Operator, Viewer), user profiles, and audit logs
- **Camera Management** - Add/edit/delete cameras with RTSP, IP camera, and USB camera support with health monitoring
- **Live Monitoring Dashboard** - Multi-camera live streaming with grid layouts (1, 4, 9, or 16 cameras)
- **AI Model Library** - 10 configurable detection models with enable/disable toggles and confidence thresholds
- **Video Processing** - Upload videos for batch processing with all AI models
- **AI Chatbot** - Natural-language querying of system data using LangChain and OpenAI
- **Analytics Dashboard** - Real-time metrics, detection trends, model performance, and camera health
- **Reports** - Generate and export daily, weekly, and monthly reports (PDF, Excel, CSV)
- **Notifications** - Real-time alerts for detections and system events

### AI Models
1. Person Detection - Detect, count, and track people
2. Vehicle Detection - Cars, bikes, trucks, buses
3. Face Detection - Face detection, counting, unknown face alerts
4. PPE Detection - Helmet, safety vest, gloves, face mask
5. Fire & Smoke Detection - Fire detection with emergency alerts
6. Intrusion Detection - Restricted area entry, zone monitoring, line crossing
7. Crowd Detection - Crowd counting, density estimation, congestion alerts
8. Fall Detection - Human fall detection with emergency notifications
9. Abandoned Object Detection - Unattended bag/object detection with time-based alerts
10. License Plate Recognition - Number plate detection with OCR extraction

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **State Management**: React Context API
- **Routing**: React Router v6
- **Styling**: Custom CSS with enterprise blue & white theme
- **Charts**: Recharts
- **Icons**: React Icons
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with bcrypt password hashing
- **AI/ML**: OpenCV, YOLO (Ultralytics), Face Recognition (dlib)
- **API Documentation**: Auto-generated Swagger/OpenAPI

### Deployment
- **Frontend**: Vercel
- **Backend**: Docker containerization
- **Database**: PostgreSQL (containerized or managed service)