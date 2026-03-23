# GroupSpace 🎓

A modern, real-time student collaboration and thesis management platform. 

![GroupSpace Preview](docs/placeholder-preview.png) *(Placeholder for dashboard screenshot)*

---

## 🎯 Problem Statement

University projects and thesis research often require juggling multiple tools: WhatsApp for chat, Google Drive for files, Notion for tasks, and email for supervisor feedback. This fragmentation leads to lost files, missed deadlines, and poor team visibility. 

**GroupSpace** solves this by unifying team collaboration, task tracking, file sharing, and professor workflows into a single, cohesive, data-dense platform. 

---

## 🌟 Product Overview

GroupSpace is an all-in-one SaaS platform built for universities and educational institutions. It provides dedicated workspaces for:
- **Students**: Manage course teams, track project progress, upload files, chat in real-time, and manage thesis deadlines.
- **Professors**: Oversee courses, monitor team progress, assign milestones, and review thesis submissions effortlessly.
- **Supervisors**: Provide structured feedback on thesis drafts and schedule meetings.
- **Administrators**: Get a bird's-eye view of all platform data via a powerful central control panel.

### ✨ Key Features
- **Centralized Dashboards**: Personalized views for Students, Professors, Supervisors, and Admins.
- **Team Workspaces**: Real-time Chat, integrated Kanban-style Task tracking, File sharing, and milestone progress bars.
- **Thesis Workflow Engine**: End-to-end management from proposal to final submission, handling drafts, supervisor feedback, and formal deadlines.
- **Real-time Notifications**: Live platform alerts for mentions, completed tasks, and upcoming due dates.
- **Admin Command Center**: A "Linear-style" data-dense CRUD interface for managing all platform relationships and broadcasting system-wide announcements.

---

## 💻 Tech Stack

GroupSpace is built with modern, scalable, and type-safe web technologies:

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server & Client Components)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Storage, Realtime)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: Designed for [Vercel](https://vercel.com/)

### 🏗️ Architecture Overview

The system strictly adheres to secure Data fetching paradigms:
1. **Server Components**: Used heavily for initial dashboard data loads, eliminating client-side loading spinners and improving SEO/performance.
2. **Server Actions (`actions.ts`)**: Handling secure mutations (CRUD operations) bypassing traditional API routes. For administrative tasks, a specialized set of Server Actions utilizes Supabase Service Role keys to safely bypass Row Level Security (RLS) within an isolated scope.
3. **Database RLS**: All standard data access is guarded by Postgres Row Level Security matrices. Students can only see their enrolled courses, their active teams, and their respective tasks.

---

## 🗄️ Database Schema (High-Level)

The PostgreSQL database is fully relational to track complex academic structures:
- **`profiles`**: Stores base user data (Role: student, professor, admin).
- **`courses` & `course_members`**: Tracks which professors own which classes, and mapping student enrollments.
- **`teams` & `team_members`**: Groups students inside courses.
- **`tasks`**: Linked to specific teams (includes due dates, status, priorities).
- **`thesis_projects`, `thesis_milestones`, `thesis_submissions`**: A dedicated schema cluster handling the timeline of academic research papers.
- **`announcements`**: A broadcast system payload table utilizing targeting rules to push banners to specific audiences.

---

## 🛠️ Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/Jatinx3/groupSpace.git
cd groupSpace
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
*(Never commit this file to version control. The Service Role key is explicitly required for secure Admin bypass actions).*

### 3. Database Initialisation
Apply the SQL migrations located in the root directory (or your Supabase migrations folder) in the Supabase SQL editor:
1. Setup Base schema (profiles, courses, teams)
2. `DB_MIGRATION_AI_USAGE.sql`
3. `DB_MIGRATION_ANNOUNCEMENTS.sql`
4. `DB_MIGRATION_MEETINGS.sql`

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🚀 Deployment

1. Push your repository to GitHub.
2. Connect the repository to **Vercel**.
3. In Vercel's project settings, add the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Trigger a deployment. Vercel will automatically configure the required Next.js build steps.

---

## 🔮 Future Improvements / Roadmap

- [ ] **AI Project Assistant**: Integrate OpenAI for contextual project help, summarizing chat logs, or suggesting literature for thesis drafts.
- [ ] **Calendar Integrations**: Sync course deadlines and milestones natively with Google Calendar / Outlook.
- [ ] **Advanced Analytics**: Give professors deeper metrics on team engagement and contribution parity (detecting free-riders early).

---
*Built with ❤️ for better academic collaboration.*
