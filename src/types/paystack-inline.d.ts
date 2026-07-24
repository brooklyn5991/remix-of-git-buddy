declare module "@paystack/inline-js" {
  export interface PaystackTransactionOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    channels?: Array<"card" | "bank" | "ussd" | "qr" | "mobile_money" | "bank_transfer" | "eft">;
    reference?: string;
    metadata?: Record<string, unknown>;
    onSuccess?: (transaction: { reference: string; status: string; trans: string; message: string }) => void;
    onCancel?: () => void;
    onLoad?: () => void;
    onError?: (error: unknown) => void;
  }
  export default class PaystackPop {
    newTransaction(options: PaystackTransactionOptions): void;
  }
}
