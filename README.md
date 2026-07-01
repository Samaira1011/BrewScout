# VibeCheck ☕✨
> Find the local cafe that gets your vibe. Real reviews. Receipt-verified.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.21-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Firebase](https://img.shields.io/badge/Firebase-11.0.2-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.16-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Resend](https://img.shields.io/badge/Resend-Mailer-000000?style=for-the-badge&logo=email)](https://resend.com/)

---

VibeCheck is a gamified cafe reviews community built for modern remote workers, brunch explorers, vinyl listeners, and late-night thinkers. It connects coffee lovers with high-quality local spots through transparent, receipt-verified feedback.

## 🎨 Premium UI & Interactive Features

- 📱 **Interactive Vibe Diagnostics**: Click and switch between presets (Focus, Date, Character, Night) in our hero dashboard to preview stats (WiFi, Noise, Seating, Coffee quality) transitioning smoothly.
- ✨ **Gently Floating 3D Cards**: Aesthetic review bubbles and score tags float independently in the hero header to mimic a live social feed.
- 🌈 **Color-matched Hover Glows**: Category cards light up with custom shadows and gradient borders corresponding to their theme (lime-green, pastel pink, neon purple, and golden yellow).
- 💎 **Glassmorphic Layouts**: Smooth backdrop blur filter elements and premium typography from Google Fonts (Outfit & Inter).

---

## ☕ Pick Your Mood: Vibe Explorer

| Vibe | Signature Theme | 📶 WiFi Speed | 🔇 Quietness | 🛋️ Aesthetics | ☕ Coffee Quality |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **💻 Deep Focus** | Lime Green (`#c9ff4d`) | **98%** | **92%** | 90% | 88% |
| **🥐 Date-worthy** | Pastel Pink (`#ff8a9a`) | 65% | 40% | **96%** | **94%** |
| **🎧 Main Character** | Neon Purple (`#b993ff`) | 78% | 85% | 92% | **98%** |
| **🌙 Late-night** | Golden Yellow (`#ffd66b`) | 80% | 90% | **95%** | 85% |

---

## 🚀 Key Functional Modules

### 1. Verification System
- **Student Verification**: Reviewers upload their student ID cards to receive a **50 PTS** reward and double their voting power.
- **Receipt Verification**: Upload receipt images to get reviews certified and earn extra points.

### 2. Gamified Loyalty Points & Tiers
- Earn points by leaving feedback, tagging vibes, or getting verified.
- Unlock member tiers: **Bronze Explorer** ➔ **Silver Explorer** (200 PTS) ➔ **Gold Explorer** (500 PTS).
- Redeem points at local shops for free cappuccinos, croissants, and deals.

### 3. Merchant Portal
- Cafe owners can claim their venue.
- Approve/reject claims through the Admin Moderation Hub.
- Owners can publish flash deals, coordinate events, and check out customer discount vouchers.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (using Prisma Client)
- **Authentication**: Firebase Client SDK + Firebase Admin SDK session cookies
- **Styling**: Tailwind CSS + Custom CSS keyframe animations
- **Unit & Integration Testing**: Vitest test runner
- **Email Dispatch**: Resend integration (sandboxed domain support fallback)

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory (use `.env.example` as a template):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/vibecheck"
DIRECT_URL="postgresql://user:password@localhost:5432/vibecheck"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-firebase-admin-email"
FIREBASE_PRIVATE_KEY="your-private-key"
RESEND_API_KEY="re_yourApiKey"
```

### 3. Database Migration & Seed
Initialize database schemas and generate custom Prisma Client:
```bash
npx prisma db push
npm run seed
```

### 4. Running the Dev Server
Start Next.js locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Running Tests
Run the Vitest integration suite:
```bash
npm run test
```
