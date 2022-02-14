import { useRequest } from "ahooks";
import { getForeignExchangeRateRequest } from "./api";
import { ForeignExchangeResponse } from "../../pages/api/fx";

export function useGetForeignExchangeRate({
  onSuccess,
}: {
  onSuccess: (data: ForeignExchangeResponse) => void;
}) {
  return useRequest(getForeignExchangeRateRequest, {
    manual: true,
    onSuccess,

    // cacheTime: 30 * 1000, // 30s in milliseconds
    // cacheKey,
  });
}
