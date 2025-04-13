# 🧠 Riddle — Web3 Wordle Game

A gamified Wordle-like experience powered by Web3. Connect your wallet, solve the riddle, and claim your crypto reward.

Built using [Next.js App Router](https://nextjs.org/docs/app), RainbowKit, Wagmi, and TailwindCSS.

---

## 🚀 Getting Started

Install dependencies and run the dev server:

```bash
pnpm install
pnpm dev
```

> Open [http://localhost:3000](http://localhost:3000) in your browser to play the game locally.

---

## 🧩 Tech Stack

- **Next.js 14 (App Router)** – Server components + SEO
- **TypeScript** – Strongly typed development
- **RainbowKit + Wagmi** – Wallet connection and smart contract interaction
- **Tailwind CSS** – Utility-first styling
- **Canvas Animation** – Interactive particles background
- **SEO + OpenGraph** – Optimized social sharing & metadata

---

## 📁 Key Folders

```bash
/app              # Main pages and layout
/components       # UI components like WalletAuth
/lib              # Utility functions
/services         # Client-side helpers (e.g. eligibility check)
/public/images    # OG images & favicon
```

---

## 🌐 Deployment

This app is optimized for deployment on [Vercel](https://vercel.com). You can deploy instantly by clicking below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import)

---

## 📝 Notes

- Make sure to update `/app/layout.tsx` and `metadata` for SEO
- Favicon files are stored in `public/` and automatically linked
- The riddle eligibility is handled via API from the backend service

---

## 🛠 Useful Commands

```bash
pnpm dev       # Run dev server
pnpm build     # Build for production
pnpm lint      # Lint TypeScript & formatting
```

---

## 👨‍💻 Author

Made with 💚 by [@dante4rt](https://twitter.com/dntyk)

MIT License
