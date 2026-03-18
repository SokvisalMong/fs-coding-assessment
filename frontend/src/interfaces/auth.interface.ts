export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginActionResponse {
  success: boolean;
}

export interface RegisterPayload {
  username: string;
  email?: string;
  password: string;
}

export interface RegisterActionResponse {
  success: boolean;
}

export interface User {
  id: string;
  username: string;
  email?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}
