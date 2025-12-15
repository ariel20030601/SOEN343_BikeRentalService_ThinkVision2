# Bike Rental Service - ThinkVision

## Description
Full-stack bike rental prototype built for SOEN343. Provides a mobile-first frontend (Expo / React Native) and a Spring Boot backend. Supports user authentication, station & bike browsing on maps, reservations, billing, loyalty tiers, operator tools.

## Features
- User registration, login and session management
- Map-based station and bike browsing (rider & operator views)
- Bike reservation and QR scanner for unlocking
- Billing, trip receipts and payment hooks
- Loyalty tiers and flex-dollars
- Notifications and trip summary modal
- Backend controllers for BMS / PRC / balancing subsystems
- DB migrations included for schema setup

## Tech Stack / Requirements
- Frontend
  - Expo (React Native) + Expo Router, TypeScript
  - Node.js (recommended LTS)
  - npm or yarn
- Backend
  - Java 21
  - Maven
  - MySQL
 
## Screenshots
<img src="https://github.com/user-attachments/assets/e1dca294-a0f2-4146-96fd-d8c04105b0ed" width="400" />
<img src="https://github.com/user-attachments/assets/61ffdab7-3caa-42fc-afe5-3cd5d2d63ecb" width="400" />
<img src="https://github.com/user-attachments/assets/0753c83d-75e8-4519-a9da-275cd8f5294b" width="400" />
<img src="https://github.com/user-attachments/assets/e8467569-3e95-4bb0-804a-9f3636004bf8" width="400" />

## Team Members
<br>

|             Name           |    Student ID    |       Roles       |
|----------------------------|------------------|-------------------|
|       Ariel Kegeles        |     40264293     |      Frontend     |
|        Nasib Guma          |     40283693     |      Backend      |
|     Robert Craciunescu     |     40282245     |      Frontend     |
|     Mohamed Mahmoud        |     40283160     |      Backend      |
|     James Bautista         |     40272010     |      Frontend     |
|     Ramiro Juarez          |     40284034     |      Backend      |

## Installation

Clone repository:
```bash
git clone https://github.com/ariel20030601/SOEN343_BikeRentalService_ThinkVision2.git
cd SOEN343_BikeRentalService_ThinkVision2
```

Backend (Spring Boot)
```bash
cd backend
./mvnw clean package
# Run:
./mvnw spring-boot:run
# or
java -jar target/<artifact>.jar
```

Frontend (Expo)
```bash
cd frontend
npm install   # or yarn
npx expo start
# then open on device / simulator or press "w" to open web
```

## Configuration
- Backend configuration: `backend/src/main/resources/application.yml`
  - Common properties to set (via YAML):
    - `spring.datasource.url`
    - `spring.datasource.username`
    - `spring.datasource.password`
  - DB migrations are in `backend/src/main/resources/db/migration`.

Example environment run:
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/bikedb \
SPRING_DATASOURCE_USERNAME=youruser \
SPRING_DATASOURCE_PASSWORD=yourpass \
./mvnw spring-boot:run
```

## Project Structure
- `backend/` — Spring Boot application
  - `src/main/java/com/thinkvision/backend` — controllers, services, entities, repositories
  - `src/main/resources` — `application.yml`, DB migrations, static files
- `frontend/` — Expo React Native app (TypeScript)
  - `app/` — screens and routing (`(tabs)` contains main app pages)
  - `api/` — frontend API clients
  - `components/` — shared components
  - `contexts/` — AuthContext, StationContext, etc.
