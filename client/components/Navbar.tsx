"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b px-10 py-4">
      <Link href="/" className="text-lg font-semibold">
        ClassMate
      </Link>

      <div className="flex gap-4">
        <Link href="/courses">Courses</Link>
        <Link href="/dashboard">My Courses</Link>
        <Button variant={"outline"} asChild className="-translate-y-1">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </nav>
  );
}
