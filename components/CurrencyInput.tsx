import CurrencySelect from "./CurrencySelect";
import React, { ChangeEvent, useCallback, useMemo } from "react";
import currencies from "./currencies.json";
import { useControllableValue } from "ahooks";
import { Currency } from "../domain/currency";
import NumberFormat from "react-number-format";

export interface CurrencyInputProps {
  currency: string;
  amount: string;
  onCurrencyChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  loading: boolean;
}

const CurrencyInput: React.FC<CurrencyInputProps> = (props) => {
  const { loading } = props;

  const [amount, setAmount] = useControllableValue<string>(props, {
    trigger: "onAmountChange",
    valuePropName: "amount",
  });

  const [currency, setCurrency] = useControllableValue<string>(props, {
    trigger: "onCurrencyChange",
    valuePropName: "currency",
  });

  const onAmountChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAmount(e.target.value.replace(/([^0-9\.]|(\.){2,})/gi, ""));
    },
    [setAmount]
  );

  const onCurrencyChangeHandler = useCallback(
    (currency: Currency) => {
      setCurrency(currency.code);
    },
    [setCurrency]
  );

  const selectedCurrency = useMemo(() => {
    return currencies.find((value) => value.code === currency);
  }, [currency]);

  return (
    <div className="mt-1 relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-500 sm:text-sm">
          {selectedCurrency?.symbol ?? ""}
        </span>
      </div>
      <NumberFormat
        type="text"
        name="price"
        id="price"
        thousandSeparator={true}
        decimalSeparator="."
        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 pr-12 sm:text-sm border-gray-300 rounded-md"
        value={amount}
        onChange={onAmountChangeHandler}
        disabled={loading}
      />
      <div className="absolute inset-y-0 right-0 flex items-center w-32">
        <CurrencySelect
          value={selectedCurrency}
          onChange={onCurrencyChangeHandler}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default CurrencyInput;
