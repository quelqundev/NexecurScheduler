export class FreeAccount {
    id: number;
    key: string;
};

export interface SMSConfig {
    freeaccounts: Array<FreeAccount>;
};

