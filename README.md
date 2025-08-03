# 🧾 HODLTracker

**HODLTracker** is a crypto-native web app that helps users track their crypto asset holding periods — with **FIFO logic** — especially for tax rules like Germany's **1-year tax-free** exemption. The tool lets users see when assets become tax-free, visualize holding times, and export data for tax reporting.

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
| Frontend    | Vite + Vue 3 + TypeScript + Tailwind  |
| Wallet      | Reown AppKit + Wagmi + Viem           |
| API         | Covalent / Alchemy / Etherscan        |
| FIFO Engine | Local JS logic (Node.js / TypeScript) |
| Backend     | Supabase or Firebase (optional)       |
| Alerts      | Telegram Bot API + SendGrid           |
| Hosting     | Vercel / Netlify                      |

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/mtp721/HODLTracker.git
cd HODLTracker

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your API keys and WalletConnect project ID

# Start development server
npm run dev
```

## 🔧 Configuration

### Reown AppKit Setup

1. Get a project ID from [Reown Dashboard](https://dashboard.reown.com)
2. Update the project ID in your `.env` file
3. The app will automatically configure wallet connections

### Environment Variables

Create a `.env` file with:

```env
# Reown AppKit
VITE_REOWN_PROJECT_ID=your_project_id_here

# API Keys (optional for development)
VITE_COVALENT_API_KEY=your_covalent_key_here
VITE_ALCHEMY_API_KEY=your_alchemy_key_here
VITE_ETHERSCAN_API_KEY=your_etherscan_key_here
```

---

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📁 Project Structure

```
src/
├── components/          # Reusable Vue components
├── stores/             # Pinia state management
│   ├── wallet.ts       # Wallet connection state
│   ├── portfolio.ts    # Portfolio & FIFO calculations
│   └── settings.ts     # User settings & preferences
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── views/              # Page components
│   ├── Home.vue        # Landing page
│   ├── Dashboard.vue   # Main dashboard
│   ├── Portfolio.vue   # Asset breakdown
│   ├── TaxFree.vue     # Tax-free tracking
│   ├── Export.vue      # Data export
│   └── Settings.vue    # User settings
├── router/             # Vue Router configuration
├── App.vue             # Root component
├── main.ts             # App entry point
└── style.css           # Global styles
```

---

## 🔄 Recent Updates

### v1.3.0 (Latest)

- ✅ Migrated to Reown AppKit for enhanced wallet functionality
- ✅ Updated to latest dependency versions
- ✅ Improved wallet connection with 600+ wallet support
- ✅ Added smart account and embedded wallet support
- ✅ Enhanced TypeScript support

### v1.1.0

- ✅ Migrated from deprecated Web3Modal to Reown AppKit
- ✅ Added support for email and social login
- ✅ Enhanced wallet connection with 600+ wallet support
- ✅ Added on-ramp and swap functionality
- ✅ Improved smart account support
- ✅ Added notification system

### v1.0.0

- ✅ Updated to Vue 3.4.21
- ✅ Updated all dependencies to latest versions
- ✅ Added Wagmi v2 integration
- ✅ Improved TypeScript support
- ✅ Enhanced ESLint configuration

### Key Dependency Updates

- **Vue**: 3.4.21 → 3.5.18
- **Vite**: 5.1.4 → 7.0.6
- **TypeScript**: 5.3.3 → 5.9.2
- **Tailwind CSS**: 3.4.1 → 4.1.11
- **Wagmi**: 2.5.7 (latest)
- **@wagmi/vue**: 0.1.25 (new)
- **@tanstack/vue-query**: 5.83.1 (new)
- **All other dependencies**: Updated to latest stable versions

---

## 🆕 Current Features

HODLTracker now uses the latest Web3 technologies:

- **🔗 Wallet Connections**: 600+ wallets via Reown AppKit
- **📊 Data Management**: TanStack Query for efficient data fetching
- **🎨 Modern UI**: Latest Tailwind CSS with improved styling
- **🔧 Type Safety**: Enhanced TypeScript support
- **⚡ Performance**: Latest Vite build system
- **🧠 Smart Accounts**: Embedded wallet and smart account support

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

This tool is for informational purposes only. Please consult with a qualified tax professional for your specific tax situation. The authors are not responsible for any tax consequences resulting from the use of this software.
