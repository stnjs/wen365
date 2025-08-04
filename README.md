# 🧾 HODLTracker

A crypto-native web app for tracking crypto asset holding periods with FIFO logic for tax exemptions. Perfect for DeFi users and tax planning in countries like Germany.

## 🎯 Features

- **🔗 Wallet Integration**: Connect any Ethereum wallet (MetaMask, WalletConnect, etc.)
- **📊 FIFO Tracking**: First-In-First-Out logic for accurate tax calculations
- **⏳ Tax-Free Countdown**: Visual countdown to when assets become tax-free (365 days)
- **🔔 Smart Alerts**: Email/Telegram notifications when tokens pass tax-free threshold
- **📤 Data Export**: CSV reports for tax advisors
- **🛠️ DeFi Ready**: Manual classification for bridge, staking, and LP transactions

## 🛠 Tech Stack

| Layer           | Stack                                  |
| --------------- | -------------------------------------- |
| Frontend        | Nuxt 4 + Vue 3 + TypeScript + Tailwind |
| Wallet          | Reown AppKit + Wagmi + Viem            |
| Package Manager | pnpm (fast, efficient, secure)         |
| API             | Covalent / Alchemy / Etherscan         |
| FIFO Engine     | Local JS logic (Node.js / TypeScript)  |
| Backend         | Supabase or Firebase (optional)        |
| Alerts          | Telegram Bot API + SendGrid            |
| Hosting         | Vercel / Netlify                       |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Ethereum wallet (MetaMask, etc.)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mtp721/HODLTracker.git
   cd HODLTracker
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` and add your API keys:

   ```env
   # Reown AppKit Project ID (required)
   VITE_REOWN_PROJECT_ID=your_project_id_here

   # Optional API keys for enhanced functionality
   VITE_COVALENT_API_KEY=your_covalent_key_here
   VITE_ALCHEMY_API_KEY=your_alchemy_key_here
   VITE_ETHERSCAN_API_KEY=your_etherscan_key_here
   ```

4. **Start development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Reown AppKit Setup

1. **Get Project ID**: Visit [Reown Cloud](https://cloud.reown.com) (formerly WalletConnect Cloud)
2. **Create Project**: Create a new project and copy the Project ID
3. **Add to .env**: Set `VITE_REOWN_PROJECT_ID=your_project_id`

### API Keys (Optional)

- **Covalent**: For multi-chain transaction data
- **Alchemy**: For Ethereum-specific data
- **Etherscan**: For transaction verification
- **SendGrid**: For email notifications
- **Telegram Bot**: For instant notifications

## 📁 Project Structure

```
HODLTracker/
├── pages/              # Nuxt pages (file-based routing)
│   ├── index.vue       # Landing page
│   ├── dashboard.vue   # Main dashboard
│   ├── portfolio.vue   # Asset breakdown
│   ├── tax-free.vue    # Tax-free tracking
│   ├── export.vue      # Data export
│   └── settings.vue    # User settings
├── components/         # Reusable Vue components
├── layouts/            # Nuxt layouts
│   └── default.vue     # Default layout with navigation
├── stores/             # Pinia state management
│   ├── wallet.ts       # Wallet connection state
│   ├── portfolio.ts    # Portfolio & FIFO calculations
│   └── settings.ts     # User settings & preferences
├── types/              # TypeScript type definitions
├── config/             # Configuration files
│   └── reown.ts        # Reown AppKit configuration
├── plugins/            # Nuxt plugins
│   └── reown.client.ts # Reown AppKit client plugin
├── assets/             # Static assets
│   └── css/            # Global styles
├── public/             # Public static files
├── server/             # Server-side code
│   ├── api/            # API routes
│   └── middleware/     # Server middleware
├── composables/        # Vue composables
├── nuxt.config.ts      # Nuxt configuration
├── tailwind.config.ts  # Tailwind CSS configuration
└── package.json        # Dependencies and scripts
```

## 🎨 Styling

The app uses **Tailwind CSS v4** with custom design tokens:

- **Primary Colors**: Blue gradient for brand identity
- **Crypto Colors**: Green (profit), Red (loss), Yellow (warning), Purple (neutral)
- **Typography**: Inter (sans-serif) + JetBrains Mono (monospace)
- **Components**: Pre-built button, card, and input styles

## 🔄 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm generate         # Generate static site

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm type-check       # TypeScript type checking
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting

# Maintenance
pnpm clean            # Clean dependencies and build files
pnpm reinstall        # Clean install dependencies
```

### Key Benefits of Nuxt 4

- **🚀 Server-Side Rendering (SSR)**: Better SEO and performance
- **📱 File-based Routing**: Automatic route generation from pages/
- **🔧 Auto-imports**: No need to import components and composables
- **⚡ Built-in Optimization**: Automatic code splitting and optimization
- **🛠️ Full-stack Ready**: API routes and server middleware included
- **🎯 TypeScript First**: Zero-config TypeScript support

## 📊 FIFO Logic

The app implements First-In-First-Out (FIFO) logic for crypto tax calculations:

1. **Acquisition Tracking**: Records when tokens are acquired
2. **Disposal Matching**: Matches sales to oldest acquisitions first
3. **Holding Period**: Tracks days held for each token batch
4. **Tax-Free Threshold**: Highlights tokens held for 365+ days

## 🔔 Notifications

- **Email Alerts**: SendGrid integration for tax-free notifications
- **Telegram Bot**: Instant notifications via Telegram
- **In-App Alerts**: Real-time notifications in the dashboard

## 📤 Data Export

Export functionality includes:

- **CSV Reports**: Detailed holding information
- **Tax Advisor Format**: Professional tax reporting
- **Custom Date Ranges**: Flexible export periods
- **Multiple Formats**: CSV, JSON, and PDF options

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables**: Add your API keys in Vercel dashboard
3. **Deploy**: Automatic deployments on push to main branch

### Netlify

1. **Build Command**: `pnpm build`
2. **Publish Directory**: `.output/public`
3. **Environment Variables**: Add in Netlify dashboard

### Self-Hosted

```bash
# Build the application
pnpm build

# Start production server
pnpm preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for informational purposes only. Please consult with a qualified tax professional for your specific tax situation. The authors are not responsible for any tax consequences resulting from the use of this software.

## 🔄 Recent Updates

### v1.0.0 - Nuxt 4 Migration

- **🚀 Migrated to Nuxt 4**: Full-stack framework with SSR
- **📦 Updated to pnpm**: Faster, more efficient package management
- **🔧 Reown AppKit Integration**: Modern wallet connection solution
- **🎨 Tailwind CSS v4**: Latest styling with custom design tokens
- **⚡ Performance Improvements**: Better loading and SEO
- **🛠️ Developer Experience**: Auto-imports, file-based routing, TypeScript

### Previous Versions

- **Vue 3 + Vite**: Initial setup with modern frontend stack
- **Web3Modal v3 → v4**: Wallet connection evolution
- **Wagmi Integration**: Ethereum hooks and utilities
- **Pinia State Management**: Reactive state management
- **ESLint + Prettier**: Code quality and formatting
