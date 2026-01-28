"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

export default function LoginForm() {
  async function onSubmit(e: any) { // fix type later
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-4">
      <Input name="email" placeholder="Email" />
      <Input name="password" type="password" placeholder="Password" />
      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  );
}
