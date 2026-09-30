# RightsFlow PayTrack 🎬💳

> **Enterprise TV Programme Rights Disbursement Pipeline & 7-Day Payment Reminder Tracker**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFA611?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

---

## 📌 Executive Summary

**RightsFlow PayTrack** is a specialized financial operations and broadcast rights acquisition tracking dashboard. It enforces compliance with contractual disbursement terms between television networks/broadcasters and international content distributors, studios, and production houses.

The platform eliminates costly broadcast compliance penalties and vendor friction by instituting a **strict 7-day payment reminder countdown clock** that automatically activates the moment both **Broadcast Material Delivery** (clean masters, subtitles, metadata) and a verified **Vendor Commercial Invoice** are checked in.

---

## 🚀 Key Features

### 1. ⏱️ 7-Day Dual-Verification Payment Countdown
- Dynamic countdown starts only when **both** conditions are verified:
  - ✅ **Material Received Date** (QCd broadcast deliverable received)
  - ✅ **Invoice Received Date** (Vendor invoice validated by finance)
- Prioritizes milestones automatically:
  - 🔴 **OVERDUE** (< 0 days remaining)
  - 🟠 **DUE TODAY** (0 days remaining)
  - 🟡 **URGENT** (1 – 7 days remaining)
  - 🔵 **UPCOMING** (> 7 days or pending deliverables)

### 2. 📑 Flexible Contract & Milestone Terms
- Supports standard international broadcast distribution payment schedules:
  - `30% / 70%`: 30% upon contract execution, 70% upon delivery & QC verification.
  - `50% / 50%`: Split advance and delivery.
  - `100% on Delivery`: Full payment disbursed post-receipt.
  - `20% / 40% / 40%`: Multi-stage staggered delivery and broadcast windowing.
  - `Custom`: Fully configurable tranches and milestone descriptions.

### 3. 💱 FX Treasury & Multi-Currency Module
- Built-in foreign exchange calculation matrix supporting multi-currency licensing contracts:
  - **USD** ($), **MYR** (RM), **EUR** (€), **GBP** (£), **SGD** (S$), **JPY** (¥), and **AUD** (A$).
  - Real-time conversion simulations for treasury cash flow forecasting.

### 4. ✉️ Disbursement & Remittance Notifications
- Standardized remittance advice generation with automatic email dispatch logging.
- Formats vendor name, contract reference, milestone tranche, bank settlement amount, and payment timestamp for accounts payable records.

### 5. 📊 Reporting, Audit Trails & Google Sheets (.xlsx) Download
- **Native Google Sheets / Excel (.xlsx) Export**: One-click download with auto-fitted columns, numeric cell formats, and multi-sheet support ready to open directly in Google Sheets.
- **CSV (UTF-8 with BOM)**: High-compatibility CSV download for legacy spreadsheets and finance ERP systems.
- **Instant Google Sheets Paste (TSV)**: Copy formatted tables directly to clipboard and press `Ctrl+V` on `sheets.new`.
- Filter and export by:
  - All programmes and contracts ledger
  - Urgent 7-day payment reminder window queue
  - Vendor & distributor exposure summary
  - Settled & paid history

### 6. 🌗 Broadcast Operations Dual Theme
- **Studio Dark Mode**: High-contrast, low-eyestrain navy palette designed for broadcast control room environments.
- **Office Light Mode**: Clean, daylight-optimized theme for administrative desks and executive reporting.

### 7. ☁️ Firebase Firestore & Multi-Account Authentication
- **Multiple Login Options**: Choose between Google One-Tap Sign-In or standard Email & Password (with dedicated **Daftar Akaun / Sign Up** and **Log Masuk / Sign In** forms).
- **Strict User Account Isolation**: Each authenticated user accesses and manages strictly their own television programme contracts and payment records. No cross-tenant data leakage.
- **Real-Time Cloud Synchronization**: Instant bi-directional sync powered by Firestore `onSnapshot`.
- **ABAC Zero-Trust Rules**: Server-side enforced security rules (`firestore.rules`) with data ownership verification (`resource.data.userId == request.auth.uid`).

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [React 19](https://react.dev/) (Hooks, Memoization, Functional Architecture)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict typing across milestones, contracts, and financial models)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with CSS variables and custom utility classes
- **Bundler**: [Vite](https://vitejs.dev/) for rapid Hot Module Replacement and production optimization
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Persistence**: Browser `localStorage` with initial broadcast industry seed data

---

## 📂 Project Directory Structure

```text
├── index.html                  # HTML entry point with metadata & fonts
├── metadata.json               # Application identity & studio capabilities
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite configuration with Tailwind CSS plugin
├── .env.example                # Template for environment variables
├── .gitignore                  # Git ignore rules for node_modules, build, logs
└── src/
    ├── main.tsx                # Application mounting point
    ├── App.tsx                 # Core pipeline coordinator & filter state
    ├── index.css               # Global styles, Tailwind layers & color definitions
    ├── types.ts                # TypeScript interfaces (Programme, Milestone, etc.)
    ├── components/
    │   ├── Header.tsx                  # Top navigation, global search, KPI bar
    │   ├── Sidebar.tsx                 # Navigation drawer & quick filters
    │   ├── MetricCards.tsx             # Financial volume, pending, and urgent KPIs
    │   ├── UrgentAlerts.tsx            # 7-day countdown priority alert queue
    │   ├── ProgrammeList.tsx           # Contract table with expandable milestones
    │   ├── AddProgrammeModal.tsx       # New contract & tranche creation form
    │   ├── EditProgrammeModal.tsx      # Contract details & milestone editor
    │   ├── FxTreasuryModule.tsx        # Multi-currency exchange rate calculator
    │   ├── EmailNotificationModal.tsx  # Vendor remittance dispatch & history
    │   ├── GoogleSheetsReportModal.tsx # Financial export & reporting modal
    │   └── Toast.tsx                   # System notification banners
    └── utils/
        ├── dateUtils.ts        # Date formatting, math & 7-day diff computations
        ├── emailService.ts     # Email dispatch formatting & storage service
        └── storage.ts          # Local storage sync & sample data generator
```

---

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/paytrack-rightsflow.git
   cd paytrack-rightsflow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables** (optional):
   ```bash
   cp .env.example .env
   ```

4. **Launch development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the Vite development server on port 3000 |
| `npm run build` | Compiles TypeScript and creates optimized production build in `/dist` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs TypeScript compiler checks (`tsc --noEmit`) |
| `npm run clean` | Cleans up `/dist` and compilation cache |

---

## 🧮 7-Day Payment Business Logic

```
   [ Programme Contract Executed ]
                  │
                  ▼
         [ Deliverables Stage ]
        ┌─────────────────────┐
        │ 1. Material QC      │
        │ 2. Vendor Invoice   │
        └─────────┬───────────┘
                  │
        Both Received = YES?
       ┌──────────┴──────────┐
       │                     │
      NO                    YES
       │                     │
       ▼                     ▼
[ Awaiting Deliverables ]   [ 7-Day Payment Countdown Initiated ]
                            • Due Date = Max(Material Date, Invoice Date) + 7 Days
                            • Daily automated countdown alerts
                            • Once paid -> Disbursed & Remittance Sent
```

---

## 📄 License

This project is licensed under the [Apache-2.0 License](LICENSE).
