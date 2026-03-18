import { RequestBody, RequestMethod } from "@/types/api";

export interface BaseResponse<Data> {
	code: number;
	message: string;
	data: Data;
	late_time?: number;
}

export interface BaseRequestParams {
  method: RequestMethod;
  endpoint: string;
  data?: RequestBody;
}