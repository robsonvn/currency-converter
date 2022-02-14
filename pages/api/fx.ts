import type { NextApiRequest, NextApiResponse } from "next";
import { URLSearchParams } from "url";
import { Amount, Fixed, MARKUP_MARGIN } from "../../domain/currency";
import { number } from "prop-types";

export interface ForeignExchangeResponse {
  conversionRate: string;
  fixedSide: string;
  buy: Amount;
  sell: Amount;
  midMarketRate: string;
}

export type ForeignExchangeRequestParams = {
  sell: string;
  buy: string;
  amount: string;
  fixed: Fixed;
};

interface RemoteForeignExchangeRateResponse {
  currencyPair: string;
  midMarketRate: string;
  fixedSide: Fixed;
}

const REMOTE_API_URL =
  "https://wnvgqqihv6.execute-api.ap-southeast-2.amazonaws.com/Public/public/rates";

export async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ForeignExchangeResponse>
) {
  // Parse request params
  const { sell, buy, fixed, amount } = JSON.parse(
    req.body
  ) as ForeignExchangeRequestParams;

  // Assemble remote API request object
  const remoteApiURL = new URL(REMOTE_API_URL);

  remoteApiURL.search = new URLSearchParams({
    Sell: sell,
    Buy: buy,
    Amount: amount,
    Fixed: fixed,
  }).toString();

  try {
    // Request the conversion rate from the remote API
    const response = await fetch(remoteApiURL.toString());

    // Throw an error in case remote request fails
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // Parse remote response
    const data = (await response.json()) as RemoteForeignExchangeRateResponse;

    const midMarketRate = normalizeMarketRate(
      data.currencyPair,
      data.midMarketRate,
      fixed === "sell" ? buy : sell
    );

    // If fixed is sell we deduct the margin on from buy amount
    const buyAmount =
      fixed === "sell"
        ? Number(amount) * midMarketRate * (1 - MARKUP_MARGIN)
        : Number(amount);

    // If fixed is buy we charge margin on top of the sell amount
    const sellAmount =
      fixed === "buy"
        ? Number(amount) * midMarketRate * (1 + MARKUP_MARGIN)
        : Number(amount);

    // Find out the conversion rate after the markup
    const conversionRateAfterMarkup = buyAmount / sellAmount;

    // Dispatch response
    res.status(200).json({
      midMarketRate: midMarketRate.toFixed(2),
      conversionRate: conversionRateAfterMarkup.toFixed(4),
      fixedSide: fixed,
      buy: {
        amount: buyAmount.toFixed(2),
        currency: buy,
      },
      sell: {
        amount: sellAmount.toFixed(2),
        currency: sell,
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error has occurred.";

    res.status(500).write(message);
  }
}

function normalizeMarketRate(
  currencyRatePair: string,
  rate: string,
  targetCurrency: string
): number {
  if (currencyRatePair.endsWith(targetCurrency)) {
    return Number(rate);
  } else {
    return 1 / Number(rate);
  }
}

export default handler;
