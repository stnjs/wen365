declare module "#auth-utils" {
  interface User {
    address: string;
    chainId: number;
  }

  interface UserSession {
    nonce?: string;
    nonceExpiresAt?: number;
  }
}

export {};
