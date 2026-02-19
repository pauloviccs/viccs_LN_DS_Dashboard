# Lumia Digital Signage

![Lumia Banner](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop)

**Lumia Digital Signage** is a next-generation SaaS platform designed for seamless management of digital displays. Built with a focus on aesthetics and performance, it features a proprietary "Liquid Glass" UI inspired by iOS 26 design principles, offering a premium experience for Administrators, Editors, and Clients.

---

## 🚀 Features

### 💎 Liquid Glass UI

- **Glassmorphism 2.0:** Advanced blur effects, mesh gradients, and transparency.
- **Fluid Animations:** Spring-physics interactions powered by Framer Motion.
- **Responsive Design:** Optimized for desktop command centers and mobile monitoring.

### 🛠️ Admin Dashboard

- **Media Manager:** Drag & drop upload for images and videos directly to cloud storage.
- **Playlist Editor:** Intuitive visual editor with drag & drop reordering (`dnd-kit`).
- **Screen Management:** Pair devices via code, monitor status (online/offline), and assign playlists remotely.
- **Client & User Management:** RBAC (Role-Based Access Control) for granular permissions (`admin`, `editor`, `client`).

### 🎨 Editor Dashboard (New)

- **Dedicated Workflow:** Specialized interface for content creators and playlist managers.
- **Advanced Analytics:** Real-time network activity charts, storage usage, and active screen metrics.
- **System Health:** Visual indicators for OS health and service status.
- **Recent Activity:** Quick view of recently updated screens and playlists.

### 📱 Client Dashboard

- **Real-time Monitoring:** View status and currently playing content for assigned screens.
- **Dynamic Profile:**
  - **Username Management:** Custom unique usernames.
  - **Avatar:** Profile picture upload with cropping tool.
- **Auto-Sync:** Changes made by admins/editors reflect instantly via Supabase Realtime.

---

## 🏗️ Tech Stack

- **Frontend:** React 19, Vite 7
- **Styling:** Tailwind CSS 4, Framer Motion
- **Icons:** Lucide React
- **Backend:** Supabase (Auth, Postgres DB, Storage, Realtime)
- **State Management:** Zustand
- **Routing:** React Router DOM 7 (with Protected Routes)

---

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/pauloviccs/viccs_LN_DS_Dashboard.git
   cd viccs_LN_DS_Dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server**

   ```bash
   npm run dev
   ```

5. **Build for Production**

   ```bash
   npm run build
   ```

---

## 🔒 License

**All Rights Reserved.**

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

<p align="center">
  Built with ❤️ by <strong>Paulo Viccs</strong>
</p>
