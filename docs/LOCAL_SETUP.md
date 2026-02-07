# 🌌 FitDay AI - Professional Setup Guide

Welcome to the command center for **FitDay AI**. This guide will walk you through initializing the advanced biological tracking engine on your local machine.

---

### 🛠️ Core Stack
- **Engine**: Next.js 15 (Edge Runtime Optimized)
- **Intelligence**: Google Gemini Pro 1.5
- **Database**: Cloudflare D1 (SQLite)
- **Styling**: Tailwind CSS + Framer Motion (Glassmorphism)

---

## ⚡ Quick Start Protocol

### 1. Initialize Neural Network (Dependencies)
```bash
npm install
```

### 2. Configure Environmental Logic
Create a `.env.local` file in the root. This is required for the AI Coach and Vision systems.

```bash
# 🧠 Google Gemini AI (Required)
# Get your key: https://aistudio.google.com/
GEMINI_API_KEY=your_apiKey_here

# 🗄️ Database ID (Optional for local)
NEXT_PUBLIC_D1_DB=your_d1_id_here
```

### 3. Database Layering
FitDay AI uses **Cloudflare D1**. You have two modes of operation:

#### A. Edge Simulation (Recommended)
This mirrors the production environment exactly.
```powershell
# Install Wrangler Globally
npm install -g wrangler

# Initialize Local Database
wrangler d1 execute FITNESS_DB --file=./db/unified_d1_schema.sql --local
```

#### B. Standard Dev
Requires the standard Next.js development server.
```bash
npm run dev
```

---

## 🚀 Launching the System

| Mode | Command | Target |
| :--- | :--- | :--- |
| **Standard** | `npm run dev` | http://localhost:3000 |
| **Edge Env** | `npm run pages:dev` | http://localhost:8788 |
| **Debug** | `npm run dev:debug` | Forced 127.0.0.1 |

---

## 🔧 Maintenance & Troubleshooting

### Port 3000 Collision
If the port is active, terminate the previous session:
```powershell
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Database Sync Issues
If data doesn't appear, re-run the schema injection:
```powershell
wrangler d1 execute FITNESS_DB --file=./db/unified_d1_schema.sql --local
```

---

### 🧬 System Features
- [x] **AI Nutritionist**: Real-time meal analysis.
- [x] **Bio-Metrics**: South Asian phenotype calibration.
- [x] **Dynamic Routing**: Instant dashboard synchronization.
- [x] **Privacy First**: Localized session management.

---

**FitDay AI** | v2.0.4 | © 2026 Integrated Bio-Systems
