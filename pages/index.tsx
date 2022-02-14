import type { NextPage } from "next";

import React, { useCallback, useEffect, useState } from "react";
import CurrencyInput from "../components/CurrencyInput";
import { useCountDown, useDebounceFn, useRequest } from "ahooks";
import { CheckIcon, RefreshIcon } from "@heroicons/react/solid";
import { getForeignExchangeRateRequest } from "../domain/currency/api";
import { Fixed } from "../domain/currency";

interface Amounts {
  amount: string;
  sell: string;
  buy: string;
  fixed: Fixed;
  conversionRate?: number;
}

const Home: NextPage = () => {
  const [sellAmount, setSellAmount] = useState("1000");
  const [buyAmount, setBuyAmount] = useState("");

  const [amounts, setAmounts] = useState<Amounts>({
    amount: sellAmount,
    sell: "AUD",
    buy: "USD",
    fixed: "sell",
    conversionRate: undefined,
  });

  const [conversionRateExpireDate, setConversionRateExpireDate] =
    useState<number>();

  const [conversionRateCountdown] = useCountDown({
    targetDate: conversionRateExpireDate,
    onEnd: () => {
      if (!loading) {
        setAmounts({
          ...amounts,
          conversionRate: undefined,
        });
      }
    },
  });

  const { loading, run: getForeignExchangeRate } = useRequest(
    getForeignExchangeRateRequest,
    {
      manual: true,
      onSuccess: ({ conversionRate, buy, sell }) => {
        setConversionRateExpireDate(Date.now() + 30000); //30s
        setAmounts({
          ...amounts,
          conversionRate: Number(conversionRate),
        });
        setBuyAmount(buy.amount);
        setSellAmount(sell.amount);
      },
    }
  );

  /* debounce get fx rate function call to prevent multiple calls on key down */
  const { run } = useDebounceFn(getForeignExchangeRate, {
    wait: 5000,
    leading: true,
  });

  /* Fetches the fx rates after the amounts change */
  useEffect(() => {
    console.log(amounts.conversionRate, amounts.buy !== amounts.sell);
    if (amounts.conversionRate === undefined && amounts.buy !== amounts.sell) {
      run(amounts);
    }
  }, [amounts, run]);

  const onSellAmountChangeHandler = useCallback(
    (value: string) => {
      setSellAmount(value);
      setAmounts({
        ...amounts,
        amount: value,
        fixed: "sell",
        conversionRate: undefined,
      });
    },
    [amounts]
  );

  const onBuyAmountChangeHandler = useCallback(
    (value: string) => {
      setBuyAmount(value);
      setAmounts({
        ...amounts,
        amount: value,
        fixed: "buy",
        conversionRate: undefined,
      });
    },
    [amounts]
  );

  const onSellCurrencyChangeHandler = useCallback(
    (value: string) => {
      setAmounts({
        ...amounts,
        amount: sellAmount,
        sell: value,
        fixed: "sell",
        conversionRate: undefined,
      });
    },
    [amounts, sellAmount]
  );

  const onBuyCurrencyChangeHandler = useCallback(
    (value: string) => {
      setAmounts({
        ...amounts,
        amount: buyAmount,
        buy: value,
        fixed: "buy",
        conversionRate: undefined,
      });
    },
    [amounts, buyAmount]
  );

  return (
    <>
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Currency Exchange
            </h2>
          </div>
          <div className="bg-white shadow sm:rounded-lg">
            <form
              className="mt-8 space-y-6 px-4 py-5 sm:p-6"
              action="#"
              method="POST"
            >
              <div className="rounded-md shadow-sm -space-y-px">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  You sell
                </label>
                <CurrencyInput
                  amount={sellAmount}
                  onAmountChange={onSellAmountChangeHandler}
                  currency={amounts.sell}
                  onCurrencyChange={onSellCurrencyChangeHandler}
                  loading={loading}
                />
              </div>
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  <li key={0}>
                    <div className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`bg-gray-400 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white`}
                          >
                            {loading ? (
                              <RefreshIcon
                                className="animate-spin h-5 w-5 text-white"
                                aria-hidden="true"
                              />
                            ) : (
                              <CheckIcon
                                className="h-5 w-5 text-white"
                                aria-hidden="true"
                              />
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Conversion rate{" "}
                              <span className="font-medium text-gray-900">
                                {amounts.conversionRate
                                  ? amounts.conversionRate?.toFixed(4)
                                  : "-"}
                              </span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {conversionRateCountdown > 0 &&
                              `will expire in ${Math.round(
                                conversionRateCountdown / 1000
                              )}s`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="rounded-md shadow-sm -space-y-px">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  You get
                </label>
                <CurrencyInput
                  amount={buyAmount}
                  onAmountChange={onBuyAmountChangeHandler}
                  currency={amounts.buy}
                  onCurrencyChange={onBuyCurrencyChangeHandler}
                  loading={loading}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
