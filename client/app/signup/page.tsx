"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setError("")

    if (!email.endsWith("@northeastern.edu")) {
      setError("Email must be a northeastern.edu address")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      setLoading(true)
      await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      alert("Signup successful! You can now log in.")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center">
      <Card className="w-100">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 -translate-y-4">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div>
            <Label className="my-1">Email</Label>
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="student@northeastern.edu"
            />
          </div>

          <div>
            <Label className="my-1">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div>
            <Label className="my-1">Confirm Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}