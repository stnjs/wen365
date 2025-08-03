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
| Wallet      | Reown AppKit + Viem                   |
| API         | Covalent / Alchemy / Etherscan        |
| FIFO Engine | Local JS logic (Node.js / TypeScript) |
| Backend     | Supabase or Firebase (optional)       |
| Alerts      | Telegram Bot API + SendGrid           |
| Hosting     | Vercel / Netlify                      |

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/stnjs/HODLTracker.git
cd HODLTracker

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your API keys and Reown project ID

# Start development server
npm run dev
```

## 🔧 Configuration

### Reown AppKit Setup

1. Get a project ID from [Reown Cloud](https://cloud.reown.com) (formerly WalletConnect Cloud)
2. Update `src/config/reown.ts` with your project ID
3. Update the metadata URL to match your domain

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
├── config/             # Configuration files
│   └── reown.ts        # Reown AppKit configuration
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

### v1.1.0 (Latest)

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

- **Reown AppKit**: Added v1.0.0 (replaces Web3Modal)
- **Vue**: 3.4.0 → 3.4.21
- **Vite**: 5.0.0 → 5.1.4
- **TypeScript**: 5.2.0 → 5.3.3
- **Tailwind CSS**: 3.3.0 → 3.4.1
- **All other dependencies**: Updated to latest stable versions

---

## 🆕 Reown AppKit Features

HODLTracker now leverages [Reown AppKit](https://docs.reown.com/appkit/overview) for enhanced functionality:

- **🔐 Email & Social Login**: Users can connect using email or social accounts
- **💳 On-Ramp**: Purchase crypto with fiat directly in the app
- **🔄 Swaps**: In-app token swapping with one line of code
- **🧠 Smart Accounts**: Enhanced security with multi-signature and automated workflows
- **📱 Multi-Chain**: Support for EVM and non-EVM chains
- **🔔 Notifications**: Web3-native notifications to wallets and in-app
- **🎨 Customizable UI**: Light/dark modes and custom branding
- **📊 Transaction History**: Built-in transaction tracking

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
