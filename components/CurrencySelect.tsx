import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { SelectorIcon } from "@heroicons/react/solid";
import currencies from "./currencies.json";
import { Currency } from "../domain/currency";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export interface CurrencySelectProps {
  value?: Currency;
  onChange: (value: Currency) => void;
  disabled: boolean;
}

const CurrencySelect: React.FC<CurrencySelectProps> = ({
  value,
  disabled,
  onChange,
}) => {
  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <>
          <div className="mt-1 relative w-full">
            <Listbox.Button
              disabled={disabled}
              className="relative w-full h-full focus:ring-indigo-500 focus:border-indigo-500 py-0 pl-3 pr-10 border-transparent bg-transparent text-center cursor-default focus:outline-none text-gray-500 sm:text-sm rounded-md"
            >
              <span className="flex items-center">
                <img
                  src={`data:image/jpeg;base64,${value?.flag}`}
                  alt=""
                  className="flex-shrink-0 w-6"
                />
                <span className="ml-3 block truncate">{value?.code}</span>
              </span>
              <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {currencies.map((currency) => (
                  <Listbox.Option
                    key={currency.code}
                    className={({ active }) =>
                      classNames(
                        active ? "text-white bg-indigo-600" : "text-gray-900",
                        "cursor-default select-none relative py-2 pl-3"
                      )
                    }
                    value={currency}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          <img
                            src={`data:image/jpeg;base64,${currency.flag}`}
                            alt=""
                            className="flex-shrink-0 w-6"
                          />
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "ml-3 block truncate w-full"
                            )}
                          >
                            {currency.code}
                          </span>
                        </div>
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};

export default CurrencySelect;
