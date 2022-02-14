import {
  ForeignExchangeRequestParams,
  ForeignExchangeResponse,
} from "../../pages/api/fx";

export async function getForeignExchangeRateRequest(
  params: ForeignExchangeRequestParams
) {
  return fetch("/api/fx", {
    method: "POST",
    body: JSON.stringify(params),
  }).then((response) => {
    return response.json() as Promise<ForeignExchangeResponse>;
  });
}
