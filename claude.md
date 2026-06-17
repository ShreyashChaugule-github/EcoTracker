# EcoTracker AI - Developer & Maintenance Guide

This document serves as the architectural blueprint and reference for AI assistants (like Claude) or engineers maintaining this full-stack application.

## 🚀 Architecture Overview

EcoTracker AI is a high-performance, full-stack web application designed to help individuals understand, track, and reduce their carbon footprint. Let's review the stack:

1. **Frontend**: React 19 (Vite Single Page Application fallback configuration)
   - **Styling**: Tailwind CSS (loaded via `@import "tailwindcss";`)
   - **Visualization**: Recharts (fully responsive charts)
   - **Icons**: Lucide icons exclusively (`lucide-react`)
   - **Ajax Client**: Axios (configured with base URLs and JWT token attachment)
2. **Backend**: Node.js/Express.js (built as a bundled, self-contained ESM/CJS file using esbuild)
   - **Security**: CORS, Helmet.js headers, express-rate-limit
   - **Validation**: express-validator schemas on incoming REST API payloads
   - **Database**: Firestore Enterprise (NoSQL document store)
   - **AI Integrations**: Server-side Google Gen AI SDK (`@google/genai`) using the `gemini-3.5-flash` model for intelligent diagnostics and habit generation

---

## 🗄️ Database Schemas (Firestore Blueprint)

EcoTracker AI relies on four primary collections:

* `users`: Maintains profile states (XP, Level, Badges, Streaks, Total CO2 Saved).
* `carbon_logs`: Detailed categories of footprint tracking (Transportation, Food, Electricity, Waste, Shopping, Water).
* `eco_actions`: Task items accepted as habits or one-offs offering carbon reductions.
* `offsets`: Track offset projects supported financially by the user.

---

## 🔒 Security Conventions

- **Zero Client-Side API Keys**: The Gemini API Key is stored server-side via `process.env.GEMINI_API_KEY`.
- **Firebase Auth Proxy**: Direct client-side calls to Firestore are minimized. Instead, requests flow through the Express backend `/api/*` proxies, validated with `express-validator` and filtered against active authentication claims in JWT/Auth tokens.
- **Helmet & CORS Configuration**: Helmet secures HTTP headers against clickjacking, sniffers, and cross-site scripting (XSS). CORS restricts backend operations to verified request frames.

---

## 📈 Recharts Patterns

To maintain responsive layout integrity:
1. Wrap all `<ResponsiveContainer>` blocks inside a parent div with fixed-height class (e.g., `h-[300px] w-full`).
2. Always pass standard types to `<BarChart>` or `<PieChart>` to secure TypeScript rendering stability.
