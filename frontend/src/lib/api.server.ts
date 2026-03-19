import "server-only";

import { cookies } from "next/headers";
import { BaseRequestParams, BaseResponse } from "@/interfaces/api.interface";
import { STATUS_CODE } from "@/enums/status-code.enum";

const authTokenKey = "authToken";

export const apiRequest = async <T> ({
  method,
  endpoint,
  data,
}: BaseRequestParams) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const requestMethod = method.toUpperCase();

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
    method: requestMethod,
    headers: requestHeaders,
    body:
      method === "get"
        ? undefined
        : data instanceof FormData
          ? data
          : JSON.stringify(data),
  });
  
  // Handle 204 No Content response
  if (response.status === 204) {
    const lateTime = performance.now() - startTime;
    return {
      code: 204,
      message: "No Content",
      data: null as T,
      late_time: lateTime,
    } as BaseResponse<T>;
  }

  const rawResponse = await response.text();
  let responseData: BaseResponse<T>;

  try {
    responseData = JSON.parse(rawResponse) as BaseResponse<T>;
  } catch {
    const message = rawResponse.slice(0, 300) || "Empty response body";
    throw new Error(`Invalid API response (${response.status}): ${message}`);
  }

  const { code, message } = responseData;

  if (code === STATUS_CODE.UNAUTHORIZED) {
    // Invalidate authToken in cookie and reset zustand store
    const cookieStore = await cookies();
    cookieStore.delete(authTokenKey);
    throw new Error("UNAUTHORIZED");
  } else if (code !== STATUS_CODE.OK && code !== STATUS_CODE.CREATED) {
    throw new Error(message);
  }

  const lateTime = performance.now() - startTime;
  responseData.late_time = lateTime;

  return responseData;
}