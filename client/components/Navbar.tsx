"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      <Link href="/" className="text-lg font-semibold">
        CourseReg
      </Link>

      <div className="flex gap-4">
        <Link href="/courses">Courses</Link>
        <Link href="/dashboard">My Courses</Link>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </nav>
  );
}
