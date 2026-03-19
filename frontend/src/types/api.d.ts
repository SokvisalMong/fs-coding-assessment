export type RequestMethod = "get" | "post" | "put" | "patch" | "delete";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequestBody = Record<string, any> | number | FormData;
