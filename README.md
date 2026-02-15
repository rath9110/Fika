# Fika - Social Maintenance Ritual

Fika is a privacy-first personal relationship management tool designed to eliminate "Emotional Friction". Instead of an alphabetical list, it turns social maintenance into a warm, low-pressure ritual.

## ✨ Features

- **Ritual Dashboard (Tiered Circles)**: Organize contacts by connection cadence (Daily, Weekly, Monthly, Quarterly).
- **The "Nudge" Engine**: Context-aware conversation starters based on personal details.
- **Privacy-First Vault**: Zero-Knowledge client-side encryption (AES-256). Your personal notes never leave your browser in plain text.
- **Micro-Animations**: A Scandi-minimalist UI with "warmth" indicators that visualizes relationship health.
- **CSV Import**: Easily migrate your inner circle.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, @dnd-kit (Drag & Drop)
- **Backend**: Node.js, Express, Prisma (ORM)
- **Database**: PostgreSQL
- **Security**: Crypto-JS (AES-256)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies for all workspaces:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` in the `server` directory:
     ```env
     PORT=5000
     DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
     ```

4. Initialize the database (Server):
   ```bash
   cd server
   npx prisma generate
   npx prisma migrate dev
   ```

5. Run the application (Root):
   ```bash
   npm run dev
   ```
   - Client: `http://localhost:5173`
   - Server: `http://localhost:5000`

## 🔒 Security Model

Fika uses **Zero-Knowledge Encryption**.
1. When you enter your Master Password in the "Vault", it stays in local storage.
2. Sensitive fields (Notes, Memory Hooks) are encrypted *before* being sent to the backend.
3. The server only sees ciphertext. If the server is compromised, your personal memories remain safe.

## 🧪 Testing

We use **Playwright** for E2E testing.
```bash
npx playwright test
```
