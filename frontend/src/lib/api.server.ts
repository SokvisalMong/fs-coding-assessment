import "server-only";

import { cookies } from "next/headers";
import { BaseRequestParams, BaseResponse } from "@/interfaces/api.interface";
import { STATUS_CODE } from "@/enums/status.enum";

const authTokenKey = "authToken";

export const apiRequest = async <T> ({
  method,
  endpoint,
  data,
}: BaseRequestParams) => {
  const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX;

  const apiUrl = `${baseApiUrl}${apiPrefix}`;

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
  }

  // Add Authorization header if auth token exists
  const authToken = (await cookies()).get(authTokenKey)?.value;
  if (authToken) {
    requestHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  const startTime = performance.now();

  const requestUrl = new URL(`${apiUrl}/${endpoint}`);

  // For GET requests, append data as query parameters
  if (method === "get" && data !== undefined) {
    // If data is a number, we can set it as a single query parameter named "value"
    if (typeof data === "number") {
      requestUrl.searchParams.set("value", String(data));
    } else if (!(data instanceof FormData)) {
      // If data is an object, we can iterate over its entries and set them as query parameters
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined || value === null) {
          continue;
        }
        requestUrl.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(requestUrl, {
    method,
    headers: requestHeaders,
    body:
      method === "get"
        ? undefined
        : data instanceof FormData
          ? data
          : JSON.stringify(data),
  });
  
  const responseData: BaseResponse<T> = await response.json();

  const { code, message } = responseData;

  if (code === STATUS_CODE.UNAUTHORIZED) {
    // clear zustand auth state
  } else if (code !== STATUS_CODE.OK && code !== STATUS_CODE.CREATED) {
    throw new Error(message);
  }

  const lateTime = performance.now() - startTime;
  responseData.late_time = lateTime;

  return responseData;
}