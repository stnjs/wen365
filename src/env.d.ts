/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REOWN_PROJECT_ID: string;
  readonly VITE_COVALENT_API_KEY: string;
  readonly VITE_ALCHEMY_API_KEY: string;
  readonly VITE_ETHERSCAN_API_KEY: string;
  readonly VITE_SENDGRID_API_KEY: string;
  readonly VITE_TELEGRAM_BOT_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
