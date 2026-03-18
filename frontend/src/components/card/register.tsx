"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button";
import { EyeSlashIcon, EyeIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterPayload } from "@/interfaces/auth.interface";
import { register } from "@/actions/auth";
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
  FieldDescription,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import { toast } from "sonner";

const formSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(255, "Username must be less than 255 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Must be at least 8 characters")
    .max(255, "Must be less than 255 characters"),
  confirmPassword: z
    .string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Must match with password",
  path: ["confirmPassword"],
})

export function RegisterCard() {
  const [isShowingPassword, setIsShowingPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const payload: RegisterPayload = {
      username: data.username,
      email: data.email || undefined,
      password: data.password,
    }

    try {
      const response = await register(payload);
      if (response.success) {
        toast.success("User registered sucessfully.")
        router.push("/login");
      }
    } catch (error) {
      form.setError("root", {
        message: (error as Error).message
      });
    }
  }

  return (
    <Card className="w-full max-w-72">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Enter registration details</CardDescription>
        <CardAction>
          <Button variant="link" className="cursor-pointer" onClick={() => router.push("/login")}>
            Login
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
              <FieldDescription className="text-destructive">
                {form.formState.errors.username ? form.formState.errors.username.message : ""}
              </FieldDescription>
            </Field>
            {/* Email */}
            <Field>
              <FieldLabel>Email (Optional)</FieldLabel>
              <InputGroup>
                <InputGroupInput placeholder="Email" {...form.register("email")} />
              </InputGroup>
              <FieldDescription className="text-destructive">
                {form.formState.errors.email ? form.formState.errors.email.message : ""}
              </FieldDescription>
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
                    onClick={() => setIsShowingPassword(!isShowingPassword)}
                  >
                    {isShowingPassword ? <EyeIcon/> : <EyeSlashIcon/>}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription className="text-destructive">
                {form.formState.errors.password ? form.formState.errors.password.message : ""}
              </FieldDescription>
            </Field>
            {/* Confirm Password */}
            <Field>
              <FieldLabel>Confirm Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  placeholder="Confirm Password"
                  type={isShowingPassword ? "text" : "password"}
                  {...form.register("confirmPassword")}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    className="cursor-pointer"
                    onClick={() => setIsShowingPassword(!isShowingPassword)}
                    >
                    {isShowingPassword ? <EyeIcon/> : <EyeSlashIcon/>}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription className="text-destructive">
                {form.formState.errors.confirmPassword ? form.formState.errors.confirmPassword.message : ""}
              </FieldDescription>
            </Field>

            <Button type="submit" className="w-full cursor-pointer">
              Register
            </Button>

            {form.formState.errors.root && (
               <FieldDescription className="text-destructive">
                 {form.formState.errors.root.message}
               </FieldDescription>
            )}
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}