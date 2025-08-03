# 🧾 HODLTracker

**HODLTracker** is a crypto-native web app that helps users track their crypto asset holding periods — with **FIFO logic** — especially for tax rules like Germany’s **1-year tax-free** exemption. The tool lets users see when assets become tax-free, visualize holding times, and export data for tax reporting.

---

## 🚀 Features

- 🔗 Connect any Ethereum wallet (MetaMask, WalletConnect)
- 📊 View per-token acquisition timeline using **FIFO**
- ⏳ Countdown timer for when assets become **tax-free** (e.g., 365 days in 🇩🇪 Germany)
- 🔔 Email or Telegram alerts when tokens pass the tax-free threshold
- 📤 Export CSV for tax advisors
- 🛠️ Manual classification (bridge, staking, LPing)
- 💼 Designed for DeFi and multi-wallet users

---

## 🧠 Why HODLTracker?

In countries like Germany, crypto gains are **tax-free after 1 year** of holding, but:

- Users do not know which tokens are tax-free
- DeFi actions make tracking FIFO very complex
- No existing tool offers a **real-time tracker** or **alerts**

HODLTracker solves this by combining wallet analysis, FIFO simulation, and tax-oriented UX.

---

## 🛠 Tech Stack

| Layer       | Stack                                 |
| ----------- | ------------------------------------- |
| Frontend    | Next.js or Vite + Vue + Tailwind      |
| Wallet      | Wagmi + viem (React) / web3modal-vue  |
| API         | Covalent / Alchemy / Etherscan        |
| FIFO Engine | Local JS logic (Node.js / TypeScript) |
| Backend     | Supabase or Firebase (optional)       |
| Alerts      | Telegram Bot API + SendGrid           |
| Hosting     | Vercel / Netlify                      |

---

## 📦 Installation

```bash
git clone https://github.com/your-username/hodltracker.git
cd hodltracker
npm install
npm run dev
```
