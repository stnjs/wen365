# Portfolio Tracker

A modern crypto portfolio tracker built with Nuxt 4. Track your crypto assets across multiple blockchains in one unified view.

## ✨ Features

### Current Features

- **Multi-Chain Portfolio Tracking**: Track your crypto tokens across multiple blockchains (Ethereum, Base, Polygon, and more)
- **Wallet Integration**: Connect your wallet securely using SIWE (Sign-In With Ethereum) authentication

### Planned Features

- **Multi-Wallet Support**: Track multiple wallets and aggregate portfolio data across all connected wallets
- **NFT Tracking**: Track NFTs across multiple chains alongside your token portfolio
- **Tax Optimization**: Track holding time of assets for tax optimization (FIFO logic for tax exemptions)
- **Asset Flow Visualization**: Visualize asset flows and transaction history
- **Maturity Notifications**: Get notified when assets reach maturity thresholds for tax benefits

## 🛠 Tech Stack

| Layer           | Stack                                  |
| --------------- | -------------------------------------- |
| Frontend        | Nuxt 4 + Vue 3 + TypeScript + Tailwind |
| UI Components   | Nuxt UI 4                              |
| Wallet          | Reown AppKit + Wagmi + Viem            |
| Package Manager | pnpm (fast, efficient, secure)         |
| API             | Alchemy API                            |
| Hosting         | Vercel / Netlify                       |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Ethereum wallet (MetaMask, etc.)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mtp721/wen365.git
   cd wen365
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
   REOWN_PROJECT_ID=your_project_id_here

   # Alchemy API Key (required)
   ALCHEMY_API_KEY=your_alchemy_key_here
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
3. **Add to .env**: Set `REOWN_PROJECT_ID=your_project_id`

### Alchemy API Key

1. **Sign up**: Create an account at [Alchemy](https://www.alchemy.com/)
2. **Create App**: Create a new app and get your API key
3. **Add to .env**: Set `ALCHEMY_API_KEY=your_api_key`

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

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables**: Add your API keys in Vercel dashboard
3. **Deploy**: Automatic deployments on push to main branch

### Netlify

1. **Build Command**: `pnpm build`
2. **Publish Directory**: `.output/public`
3. **Environment Variables**: Add in Netlify dashboard

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
