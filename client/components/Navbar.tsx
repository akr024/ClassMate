"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b px-10 py-4 my-2">
      <Link href="/" className="text-lg font-semibold">
        ClassMate
      </Link>

      <div className="flex gap-4">
        <Link href="/courses">Courses</Link>
        <Link href="/dashboard">My Courses</Link>
        <Button variant={"default"} asChild className="-translate-y-1">
          <Link href="/login">Login</Link>
        </Button>
        <Button variant={"secondary"} asChild className="-translate-y-1">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </nav>
  );
}
