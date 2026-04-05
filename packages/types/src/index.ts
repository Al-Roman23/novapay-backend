export interface Account {
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Wallet {
    id: string;
    accountId: string;
    currency: string;
    balance: string;
    lockedBalance: string;
    createdAt: Date;
    updatedAt: Date;
}
