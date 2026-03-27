# collably. 

**Empowering Academic Collaboration. Built for TUDublin.**

[collably.space](https://collably.space)

---

## 🚀 Vision
**Collably** is a unified workspace designed specifically for university students and professors to manage the entire lifecycle of a thesis, capstone project, or group hackathon. It replaces fragmented tools like WhatsApp, Email, and Google Drive with a single, highly-aesthetic, and functional dashboard.

## ✨ Core Features
- **🔒 Secure University Auth**: Strict domain restriction enforced to ensure only `@mytudublin.ie` users can sign up. 
- **🤝 Team Workspaces**: Dedicated areas for teams to share code, documents, and real-time messages.
- **⚡ Collably AI**: A specialized academic assistant for grammar proofreading, professional email drafting, and structured prompt engineering.
- **📂 Thesis & Project Management**:
  - **Milestones**: Track progress against deadlines.
  - **Drafts & Feedback**: Upload research versions and receive inline professor comments.
  - **File History**: Version control for academic assets.
- **🎨 Premium UX**: A bold, Neo-Brutalist design language optimized for high-performance research and collaboration.

## 🛠️ Technology Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Email**: Resend (Professional SMTP)
- **AI**: Gemini 2.5 Flash / Groq Llama-3 (Cascade Architecture)
- **Deployment**: Vercel

## ⚙️ Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Jatinx3/groupSpace.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
   - `TURNSTILE_SECRET_KEY`

4. **Run local dev server**:
   ```bash
   npm run dev
   ```

---

## 📜 Version History
- **V1 (27/03/2026)**: Initial Brand Rollout, Domain Restricted Auth, Collably AI v1, Team Workspaces, and Thesis Draft flow.

---
Built with ❤️ for **TUDublin** students.
