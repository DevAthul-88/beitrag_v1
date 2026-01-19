# Beitrag — Developer Productivity Dashboard

> **Enterprise-grade GitHub analytics dashboard for visualizing developer productivity using real-world engineering metrics.**

Beitrag is a portfolio SaaS-style application that integrates with GitHub to provide actionable insights into a developer’s activity, code contributions, and engineering performance. The project focuses on **data visualization, system design, and production-ready UI/UX**, rather than feature bloat.

---

## 🖼 Screenshots

![Screenshot 1](https://i.ibb.co/gZwsyzRz)
![Screenshot 2](https://i.ibb.co/WWwQFfPD)
![Screenshot 3](https://i.ibb.co/Y47LRJ6T)
![Screenshot 4](https://i.ibb.co/fzZz0T84)
![Screenshot 5](https://i.ibb.co/v42r9nMZ)
![Screenshot 6](https://i.ibb.co/7xFz9rBJ)
![Screenshot 7](https://i.ibb.co/KRwLP95)

## 🚀 Live Demo

> *https://beitrag.netlify.app/*

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

* **Next.js (App Router)**
* **TypeScript**
* **Tailwind CSS**
* **Lucide Icons**
* **Recharts / Chart.js** (data visualization)

### Backend / Services

* **Supabase** — Authentication & session management
* **GitHub REST API** — Activity & repository data
* Server-side data aggregation for metrics

---

## 🔒 Security Considerations

* OAuth tokens are never exposed to the client
* API requests are scoped to minimum required permissions
* Auth sessions handled via Supabase’s secure infrastructure
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

## 📄 License

MIT

---
