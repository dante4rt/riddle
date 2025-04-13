# 🧩 Riddle Project

A Web3-powered Wordle-style game where players solve riddles and claim crypto rewards. Built with modern technologies across smart contracts, backend APIs, and a dynamic frontend.

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

- **Next.js** – React framework for fast, scalable SSR apps.
- **TypeScript** – Safer JavaScript with static typing.
- **Wagmi** – Ethereum React hooks for smart contract interaction.
- **RainbowKit** – Plug-and-play wallet connection UI.
- **Tailwind CSS** – Utility-first responsive styling.

### Backend

- **Express.js** – Minimal Node.js framework.
- **MongoDB** – NoSQL database for tracking player state.
- **Mongoose** – Elegant MongoDB object modeling.
- **TypeScript** – Strong typing for API logic.

### Smart Contracts

- **Foundry** – Lightning-fast smart contract development toolkit.
- **Solidity** – Language of the Ethereum Virtual Machine.

---

## 🚀 Features

- ✅ Smart contract-based reward claiming mechanism.
- ✅ Wallet verification & riddle solve tracking.
- ✅ Faucet-like ETH distribution on correct answer.
- ✅ MongoDB-based cooldown and player state validation.
- ✅ Fully responsive UI with animated background.
- ✅ OpenGraph + Twitter SEO metadata.

---

## 🛠 Setup Instructions

Each sub-project (`frontend`, `backend`, `contract`) has its own `README.md` with setup steps. Start from there based on what you’re working on:

```bash
cd frontend   # or backend / contract
```

---

## 📜 License

MIT © [Rama (dante4rt)](https://github.com/dante4rt)
