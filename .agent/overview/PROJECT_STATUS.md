# Project Overview

## Project Name

Lumia - Digital Signage Solutions (Lumia Network)

## Description

Lumia is a modern, web-based Digital Signage SaaS platform replacing a legacy Electron application. It features a "Liquid Glass" UI aesthetic (iOS 26 style), a dual-dashboard system (Admin & Client), and advanced media management. The platform is built with React 19, Vite, and Tailwind CSS 4, utilizing Supabase for backend services (Auth, Database, Storage).
Recent updates include a high-performance Landing Page with a scroll-controlled 3D image sequence hero section.

## Tech Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS 4
- **State Management:** Zustand
- **Animation:** Framer Motion (Spring Physics, Scroll Animations)
- **Backend:** Supabase (Postgres, Auth, Storage, RLS)
- **Routing:** React Router DOM v7
- **UI Components:** Lucide React, React Icons, Custom Glass Components
- **Deployment:** Vercel

## Folder Structure

```text
Lumia_DigitalSinage/
├── .agent/                 # Agent context and memory
├── public/                 # Static assets (including hero animation frames)
├── src/
│   ├── components/
│   │   ├── landing/        # Landing Page specific components
│   │   │   └── HeroSequence.jsx # Scroll-controlled canvas animation
│   │   ├── ui/             # Reusable UI components (GlassCard, LiquidButton, etc.)
│   │   └── ...
│   ├── hooks/              # Custom hooks (useAuth, etc.)
│   ├── layouts/            # Layout wrappers (AdminLayout, ClientLayout)
│   ├── lib/                # Utilities and Supabase client
│   ├── services/           # API service modules
│   ├── stores/             # Zustand state stores
│   ├── views/              # Page views
│   │   ├── admin/          # Admin Dashboard views
│   │   ├── auth/           # Authentication views
│   │   ├── client/         # Client Dashboard views
│   │   └── LandingPage.jsx # Main Marketing Landing Page
│   ├── App.jsx             # Main Router configuration
│   └── main.jsx            # Entry point
├── index.html              # Entry HTML
├── package.json            # Dependencies and scripts
├── supabase_schema.sql     # Database schema definition
└── vite.config.js          # Vite configuration
```

## Implementation Status

- [x] **Project Scaffold:** Vite + React + Tailwind v4 setup.
- [x] **Design System:** "Liquid Glass" tokens and global styles implemented.
- [x] **Authentication:** Supabase Auth integration with Role-Based Access Control (RBAC).
- [x] **Admin Dashboard:**
  - Media Manager (Upload/Delete).
  - Playlist Editor (Drag & Drop).
  - Screen Management (Pairing/Status).
  - Client Management.
- [x] **Client Dashboard:**
  - Assigned Screen Monitoring.
  - Statistics Overview.
- [x] **Marketing Site:**
  - Landing Page with Liquid Glass design.
  - Hero Section with "fly-through" text and scroll-locked image sequence.
- [x] **Deployment:** Vercel deployment configuration.

## Recent Changes

- Implemented `LandingPage.jsx` as the root route (`/`).
- Created `HeroSequence.jsx` using HTML5 Canvas and Framer Motion for high-performance scroll animations.
- Fixed React Error #310 by optimizing Hook usage in `HeroSequence`.
- Updated routing to move Login to `/login`.
- Optimized loading states for large asset sequences.

## Known Issues / TODOs

- **Supabase Emails:** Custom SMTP setup may be required for production email reliability.
- **Mobile Optimization:** Complex animations in Hero section may need further tuning for low-end mobile devices.
- **Analytics:** Integration of analytics tools (e.g., PostHog/Google Analytics).
