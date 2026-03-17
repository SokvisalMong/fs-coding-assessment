"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button";
import { EyeSlashIcon, EyeIcon } from "@phosphor-icons/react";
import { useState } from "react";
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
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";

const formSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(255, "Username must be less than 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password must be less than 255 characters"),
})

export function LoginCard() {
  const [isShowingPassword, setIsShowingPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    }
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  }

  return (
    <Card className="w-full max-w-72">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter login credentials</CardDescription>
        <CardAction>
          <Button variant="link">
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
                <InputGroupInput placeholder="Username"/>
              </InputGroup>
            </Field>
            {/* Password */}
            <Field>
              <FieldLabel>Password</FieldLabel>
              <InputGroup>
                <InputGroupInput placeholder="Password" type={isShowingPassword ? "text" : "password"}/>
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    onClick={() => setIsShowingPassword(!isShowingPassword)}
                    >
                    {isShowingPassword ? <EyeIcon/> : <EyeSlashIcon/>}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex">
        <Button className="w-full">
          Login
        </Button>
      </CardFooter>
    </Card>
  )
}