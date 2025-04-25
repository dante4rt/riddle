# 🧩 Riddle Project

A **Web3-powered Wordle-style game** where players solve riddles, flip cards, and claim crypto rewards. Built with a cutting-edge stack spanning smart contracts, backend APIs, and a dynamic, interactive frontend.

Now enhanced with **card flip animations**, **donation support**, and an upcoming **leaderboard system**.

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

### Frontend

- **Next.js** – Fast, scalable React framework with SSR support.
- **TypeScript** – Strong typing for safer, more maintainable code.
- **Wagmi** – Ethereum-focused React hooks for seamless smart contract interaction.
- **RainbowKit** – Beautiful wallet connection UI, ready out-of-the-box.
- **Tailwind CSS** – Utility-first CSS for responsive and flexible design.
- **Sonner** – Toast notifications with a modern touch.

### Backend

- **Express.js** – Lightweight Node.js server framework.
- **MongoDB** – NoSQL database for managing player progress and cooldowns.
- **Mongoose** – Elegant data modeling for MongoDB.
- **TypeScript** – Static typing for robust server-side code.

### Smart Contracts

- **Foundry** – High-performance toolkit for Solidity smart contract development and testing.
- **Solidity** – Smart contract language for the Ethereum Virtual Machine (EVM).

---

## 🚀 Features

- ✅ **Smart Contract Integration** – Claim crypto rewards upon solving riddles.
- ✅ **Wallet Verification & Cooldown System** – Fair play enforced server-side.
- ✅ **Card Flip Animation** – Engaging flip transition when submitting answers.
- ✅ **Donation Support** – Players can contribute directly to the prize pool.
- ✅ **Dynamic Background Animation** – Light, interactive background effects.
- ✅ **OpenGraph & SEO Ready** – Social previews and meta optimized.
- ✅ **Mobile Responsive** – Fully optimized for phones, tablets, and desktops.
- 🚧 **Coming Soon**: **Global Leaderboard System** – Compete with players worldwide.

---

## 🛠 Setup Instructions

Each subproject (`frontend`, `backend`, `contract`) contains its own `README.md` for setup instructions. Pick your starting point:

```bash
cd frontend   # or backend / contract
npm install
npm run dev   # or your environment command
```

Make sure your local blockchain, backend API, and frontend are properly linked via `.env` configs.

---

## 🧠 Project Vision

Riddle is built for more than just fun — it’s a playground to:

- Gamify learning about Web3.
- Create fair, transparent reward systems.
- Empower players through crypto-native interactions.

This project is designed to evolve with more social and competitive features.

## 📜 License

MIT License © [Rama (dante4rt)](https://github.com/dante4rt)

## ✨ Ready to flip, solve, and earn
