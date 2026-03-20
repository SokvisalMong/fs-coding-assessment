"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button";
import { EyeSlashIcon, EyeIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginPayload } from "@/interfaces/auth.interface";
import { login } from "../../actions/auth";
import { useAuthStore } from "@/store/auth.store";
import { 
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group";
import { 
  Card, 
  CardHeader, 
  CardTitle,
  CardAction, 
  CardDescription, 
  CardContent
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import { toast } from "sonner";

const formSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(255, "Must be less than 255 characters"),
  password: z
    .string()
    .min(8, "Must be at least 8 characters")
    .max(255, "Must be less than 255 characters"),
})

export function LoginCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isShowingPassword, setIsShowingPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const payload: LoginPayload = {
      username: data.username,
      password: data.password,
    }

    try {
      setIsLoading(true)
      const response = await login(payload)
      
      if (response.success) {
        toast.success("Login successful");
        await useAuthStore.getState().initialize();
        router.push("/");
      }
    } catch (error) {
      form.setError("root", {
        message: (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-72 gap-4">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter login credentials</CardDescription>
        <CardAction>
          <Button variant="link" className="cursor-pointer" onClick={() => router.push("/register")}>
            Register
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Username */}
            <Field>
              <FieldLabel>Username</FieldLabel>
              <InputGroup>
                <InputGroupInput placeholder="Username" {...form.register("username")} />
              </InputGroup>
              <FieldError>
                {form.formState.errors.username ? form.formState.errors.username.message : ""}
              </FieldError>
            </Field>
            {/* Password */}
            <Field>
              <FieldLabel>Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  placeholder="Password"
                  type={isShowingPassword ? "text" : "password"}
                  {...form.register("password")}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    className="cursor-pointer"
                    tabIndex={-1}
                    onClick={() => setIsShowingPassword(!isShowingPassword)}
                  >
                    {isShowingPassword ? <EyeIcon/> : <EyeSlashIcon/>}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldError>
                {form.formState.errors.password ? form.formState.errors.password.message : ""}
              </FieldError>
            </Field>

            <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
              Login
              {isLoading &&
                <CircleNotchIcon data-icon="inline-end" className="animate-spin"/>
              }
            </Button>

            <FieldError>
              {form.formState.errors.root?.message}
            </FieldError>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}