# Beitrag — Developer Productivity Dashboard

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub API](https://img.shields.io/badge/GitHub-API-181717?logo=github)](https://docs.github.com/en/rest)

> **Enterprise-grade GitHub analytics dashboard for visualizing developer productivity using real-world engineering metrics.**

Beitrag is a portfolio SaaS-style application that integrates with GitHub to provide actionable insights into a developer's activity, code contributions, and engineering performance. The project focuses on **data visualization, system design, and production-ready UI/UX**, rather than feature bloat.

---

## 🚀 Live Demo

**[View Live Demo →](https://beitrag.netlify.app/)**

---

## 🖼 Screenshots

![Screenshot 1](https://i.ibb.co/Jj2Xn5s5/bh.png)

![Screenshot 2](https://i.ibb.co/KjkY7WLN/b5.png)

![Screenshot 3](https://i.ibb.co/nqsLg4T8/b4.png)

![Screenshot 4](https://i.ibb.co/PvJvCVTw/b3.png)

![Screenshot 5](https://i.ibb.co/3mt8KZPB/b2.png)

![Screenshot 6](https://i.ibb.co/1YxnSRBf/b1.png)

![Screenshot 7](https://i.ibb.co/MW6GvRg/Beitrag-01-19-2026-03-33-PM.png)

---

## 📌 Why This Project Exists

Modern engineering teams rely on metrics to understand productivity, collaboration, and delivery velocity. GitHub exposes rich activity data, but it is fragmented and difficult to interpret at a glance.

**Beitrag was built to:**

* Aggregate GitHub activity into meaningful metrics
* Visualize developer behavior using clean, readable charts
* Demonstrate real-world frontend architecture and API integration
* Showcase enterprise-level UI/UX and data handling in a portfolio project

---

## 🧠 Key Design Principles

* **Signal over features** — only high-impact metrics
* **Consistency over flexibility** — clear default time ranges
* **Readability over density** — charts designed for clarity
* **Production-grade patterns** — auth, loading states, error handling

---

## ✨ Features

### 🔐 Authentication

* Secure user authentication via **Supabase Auth**
* OAuth-based GitHub login
* Token handling designed to avoid exposing sensitive data

---

### 📊 Dashboard Overview

High-level metrics presented at a glance:

* Total commits (recent activity)
* Pull requests opened & merged
* Active repositories
* Contribution trends

---

### 📈 Commit Analytics

* Commit frequency over time
* Commit trends visualization
* Aggregated commit counts derived from GitHub events

---

### 🗓 Activity Heatmap

* GitHub-style contribution calendar
* Visualizes daily activity patterns
* Helps identify consistency and contribution streaks

---

### 🔁 Pull Request Metrics

* Total PRs opened and merged
* PR size distribution
* Productivity insights based on contribution patterns

---

### 🧩 Language Breakdown

* Pie chart showing languages used across repositories
* Derived from repository metadata
* Helps identify primary technical focus areas

---

### 📦 Repository Activity

* List of active repositories
* Commit counts and last activity timestamps
* Quick overview of project engagement

---

### 📐 DORA Metrics (Visualization)

* Deployment frequency
* Lead time for changes
* Industry-standard DevOps performance indicators
  *(Presented as visual analytics rather than operational metrics)*

---

### 🎨 UX & UI

* Fully responsive layout
* Skeleton and GitHub-style loaders
* Graceful empty states
* Accessible color contrast (light/dark modes)

---

## 🛠 Tech Stack

### Frontend

* **Next.js (App Router)** — React framework with server components
* **TypeScript** — Type-safe development
* **Tailwind CSS** — Utility-first styling
* **shadcn/ui** — Accessible UI components
* **Lucide Icons** — Modern icon library
* **Recharts / Chart.js** — Data visualization

### Backend / Services

* **Supabase** — Authentication & session management
* **GitHub REST API** — Activity & repository data
* Server-side data aggregation for metrics

---

## 📁 Project Structure

```text
.
├── public/                  # Static assets
├── src/
│   └── app/
│       ├── app/             # Main application routes
│       │   ├── commits/     # Commit analytics page
│       │   ├── dashboard/   # Dashboard overview
│       │   ├── dora-metrics/# DORA metrics visualization
│       │   ├── heatmap/     # Activity heatmap
│       │   ├── languages/   # Language breakdown
│       │   ├── providers/   # Context providers
│       │   ├── pull-requests/ # PR metrics
│       │   ├── repositories/  # Repository activity
│       │   └── settings/    # User settings
│       ├── auth/            # Authentication pages
│       ├── layouts/         # Shared layouts
│       ├── login/           # Login page
│       ├── privacy/         # Privacy policy
│       ├── terms/           # Terms of service
│       ├── types/           # TypeScript types
│       ├── favicon.ico
│       ├── globals.css      # Global styles
│       ├── layout.tsx       # Root layout
│       └── page.tsx         # Landing page
├── components.json          # shadcn/ui configuration
├── db_query.md              # Database queries documentation
├── middleware.ts            # Next.js middleware (auth routing)
├── next.config.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Supabase project
- GitHub OAuth App credentials

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Then open `http://localhost:3000` in your browser.

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

---

## 🔒 Security Considerations

* OAuth tokens are never exposed to the client
* API requests are scoped to minimum required permissions
* Auth sessions handled via Supabase's secure infrastructure
* No private repository access without explicit permission

---

## ⚙️ Architecture Overview

```txt
Client (Next.js)
   ↓
Supabase Auth (OAuth)
   ↓
Server Actions / API Routes
   ↓
GitHub REST API
   ↓
Data Aggregation & Normalization
   ↓
Charts & Metrics Rendering
```

This separation ensures:

* Clear responsibility boundaries
* Easier future extension (teams, filters, exports)
* Predictable data flow

---

## 🧪 Error & Edge Case Handling

* GitHub API rate limit awareness
* Empty state handling for new users
* Defensive programming for inconsistent API responses
* Loading placeholders to prevent layout shifts

---

## 📉 Known Limitations (Intentional)

* No global time filter (fixed recent activity window)
* No team collaboration features
* No email notifications or exports

These were **deliberate tradeoffs** to keep the project focused, readable, and aligned with portfolio goals.

---

## 🧭 Future Improvements (If Productized)

* Global time range filtering
* Team-level analytics
* Webhook-based real-time updates
* Exportable reports (CSV / PDF)
* CI/CD integration metrics

---

## 🧠 What This Project Demonstrates

* Real-world OAuth authentication
* API data normalization and aggregation
* Complex chart rendering
* UI state management
* Production-level component architecture
* Thoughtful product decision-making

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Live Demo**: [https://beitrag.netlify.app/](https://beitrag.netlify.app/)
- **Documentation**: [Project Wiki](#)
- **Issues**: [Report a Bug](#)

---

<div align="center">

**Built with ❤️ using Next.js, TypeScript, and Supabase**

</div>
