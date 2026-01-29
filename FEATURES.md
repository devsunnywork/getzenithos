# ZENITH OS v2.0 - SYSTEM MANUAL
**Status:** Online  
**Core Version:** 2.4.0 (Hyper-Velocity)

---

## 1. TECHNOLOGY STACK
The Zenith OS is built on a high-performance stack designed for speed, scalability, and modern aesthetics.

*   **Frontend**: Vanilla HTML5 / TailwindCSS (Utility-First) / Vanilla JavaScript (ES6+).
*   **Backend**: Node.js / Express.js (REST API Architecture).
*   **Database**: MongoDB Atlas (Cloud NoSQL) with Mongoose ODM.
*   **Security**: JWT (JSON Web Tokens) Authentication & Bcrypt hashing.
*   **UI/UX**: Custom "Glassmorphism" Design System, FontAwesome Icons, 'Syne' & 'Inter' Typography.

---

## 2. FEATURE MODULES

### A. The Dashboard (Command Center)
*   **Real-time Telemetry**: Live updating stats for efficiency, experience, and system status.
*   **XP System**: Tracks user engagement. Gain XP by completing missions.
    *   *Dynamic Leveling*: Progress bar tracks XP towards next level (1000 XP per level).
*   **Quick Actions**: Instant access to resume courses or jump to active missions.

### B. Mission Control (Task Matrix)
*   **Kanban Board**: Three-stage workflow (Pending, Active, Complete).
*   **Drag & Drop**: Native, smooth drag-and-drop interface for moving tasks.
*   **Tactical Modal**: Premium pop-up interface for assigning new missions.
*   **XP Rewards**: Completing a mission grants +50 XP instantly.
*   **Priority System**: Low (Grey), Medium (Blue), High (Red) indicators.

### C. Academic Core (LMS)
*   **Course Catalog**: Browse available learning modules.
*   **Enrolled View**: Track progress in specific courses.
*   **Video Player**: Integrated HTML5 video player for lectures.

### D. Identity Hub (Profile)
*   **Dynamic Avatar**: Upload and manage profile pictures.
*   **Bio & Stats**: Edit personal details and professional links (GitHub, LinkedIn).
*   **Security**: Password management and account controls.

### E. Admin Nexus (God Mode)
*   **User Management**: Block/Unblock users, view detailed user telemetry.
*   **Course Management**: Create, Edit, Delete courses and lectures.
*   **System Config**: Set global alerts, version numbers, and payment gateways dynamically.
*   **Payment Gateway**: Configurable UPI ID and QR Code for the Store.

---

## 3. DESIGN THEME: "NEURAL GLASS"

The interface follows a strict "Neural Glass" aesthetic guideline:
*   **Palette**: Deep Void Black (`#000`), Slate Grey (`#1e293b`), and Neon Blue (`#3b82f6`).
*   **Glassmorphism**: Heavy use of `backdrop-filter: blur()`, distinct white borders (`border-white/5`), and translucent backgrounds.
*   **Typography**:
    *   *Headings*: `Syne` (Bold, Wide, Aggressive).
    *   *Body*: `Inter` (Clean, Legible, Technical).
*   **Micro-interactions**: Hover glimmers, pulse animations on active elements (`animate-pulse`), and smooth transitions (`duration-300`).

---

## 4. DEPLOYMENT & SCALING
*   **Port**: Defaults to `5000`.
*   **Env Variables**: `MONGO_URI` (DB Connection), `JWT_SECRET` (Auth Key).
*   **Scalability**: Stateless JWT architecture allows for horizontal scaling.

---

**ZENITH OS // WRITTEN BY ANTIGRAVITY**
