# 🧩 Riddle Project

A **Web3-powered Wordle-style game** where players solve riddles, flip cards, and claim crypto rewards. Built with a cutting-edge stack spanning smart contracts, backend APIs, and a dynamic, interactive frontend.

Now enhanced with **card flip animations**, **donation support**, and a live **global leaderboard system**.

---

## 📁 Monorepo Structure

```text
riddle/
├── frontend/   → Next.js + Wagmi + RainbowKit interface
├── backend/    → Express + MongoDB API for validation and cooldown tracking
├── contract/   → Smart contracts written and tested with Foundry
```

---

## ⚙️ Tech Stack

### Frontend (Next.js App)

- **Next.js 15 (Turbopack)** – Blazing-fast React framework.
- **TypeScript** – Strong typing for safer, scalable code.
- **Tailwind CSS 4** – Utility-first CSS for modern, responsive design.
- **Wagmi v2** – React hooks for Ethereum smart contract interaction.
- **RainbowKit** – Elegant wallet connection UI.
- **Viem** – Lightweight and fast EVM interactions library.
- **Sonner** – Modern toast notifications.
- **Radix UI** – Accessible, headless UI primitives (dialogs, tooltips, popovers).
- **Lucide React** – Icon set for consistent UI.
- **Next Themes** – Simple dark/light theme switching.
- **Class Variance Authority / clsx** – Clean dynamic className management.
- **tw-animate-css** – Easy animations integration with Tailwind.

### Backend (Express API)

- **Express.js** – Lightweight Node.js server framework.
- **TypeScript** – Strong typing on the server.
- **MongoDB** – NoSQL database for players, cooldowns, and leaderboard storage.
- **Mongoose** – ODM for MongoDB, schema modeling.
- **JWT (jsonwebtoken)** – Secure authentication via JSON Web Tokens.
- **bcrypt** – Password hashing for admin authentication.
- **Helmet** – HTTP header security.
- **Compression** – Gzip compression for faster responses.
- **CORS** – Cross-origin resource sharing setup.
- **Viem** – EVM interaction from the backend when needed.
- **Axios** – HTTP client for internal calls.

### Smart Contracts

- **Foundry** – High-performance toolkit for Solidity smart contract development and testing.
- **Solidity** – Smart contract language for the Ethereum Virtual Machine (EVM).

---

## 🚀 Features

- ✅ **Smart Contract Integration** – Claim crypto rewards upon solving riddles.
- ✅ **Wallet Verification & Cooldown System** – Fair play enforced server-side.
- ✅ **Card Flip Animation** – Engaging flip transition when submitting answers.
- ✅ **Donation Support** – Players can contribute directly to the prize pool.
- ✅ **Global Leaderboard System** – Track and compete with top players worldwide.
- ✅ **Dynamic Background Animation** – Light, interactive particle effects.
- ✅ **OpenGraph & SEO Ready** – Social previews and metadata optimized.
- ✅ **Mobile Responsive** – Fully optimized for phones, tablets, and desktops.

---

## 🛠 Setup Instructions

Each subproject (`frontend`, `backend`, `contract`) contains its own `README.md` for setup instructions.

Basic setup flow:

```bash
# Clone the repo
git clone https://github.com/dante4rt/riddle.git
cd riddle

# Setup frontend
cd frontend
npm install
npm run dev

# Setup backend
cd ../backend
npm install
npm run dev

# Setup smart contract (optional for devs)
cd ../contract
forge install
forge build
```

- Configure your `.env` files properly (for backend API, frontend API URLs, smart contract addresses).
- Ensure MongoDB and local blockchain (if testing) are running.

---

## 🧠 Project Vision

Riddle is built for more than just fun — it’s a playground to:

- Gamify learning about Web3 concepts.
- Create fair, transparent crypto reward systems.
- Empower players through decentralized, blockchain-native gameplay.
- Experiment with social, competitive, and collaborative gaming models.

This project is designed to evolve into a fully gamified, social Web3 mini-platform.

---

## 📜 License

MIT License © [Rama (dante4rt)](https://github.com/dante4rt)
