export interface Currency {
  code: string;
  symbol?: string;
  flag: string;
}

export type Fixed = "sell" | "buy";

export interface Amount {
  currency: string;
  amount: string;
}
