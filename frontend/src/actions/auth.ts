"use server";

import { 
  LoginActionResponse, 
  LoginPayload, 
  LoginResponse,
  RegisterPayload,
  RegisterActionResponse,
  User
} from "@/interfaces/auth.interface";
import { apiRequest } from "@/lib/api.server";
import { cookies } from "next/headers";


export async function login(payload: LoginPayload) {
  const response = await apiRequest<LoginResponse>({
    method: "post",
    endpoint: "auth/login",
    data: payload,
  })

  const cookieStore = await cookies();
  cookieStore.set("authToken", response.data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: response.data.expires_in || 3600,
    path: "/",
  });

  const actionResponse: LoginActionResponse = {
    success: true,
  };

  return actionResponse;
}

export async function getCurrentUser() {
  const response = await apiRequest<User>({
    method: "get",
    endpoint: "users/me",
  });
  return response.data;
}

export async function register(payload: RegisterPayload) {
  await apiRequest({
    method: "post",
    endpoint: "auth/register",
    data: payload,
  })

  return { success: true } as RegisterActionResponse;
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("authToken");
}
