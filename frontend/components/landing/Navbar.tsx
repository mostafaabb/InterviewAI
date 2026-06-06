"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { Moon, Sun, Menu, X, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

export function Navbar() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">InterviewAI</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">Features</Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition">Pricing</Link>
            <Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition">FAQ</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg hover:bg-accent">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {user ? (
              <Link href="/dashboard"><Button>Dashboard</Button></Link>
            ) : (
              <>
                <Link href="/auth/login"><Button variant="ghost">Sign In</Button></Link>
                <Link href="/auth/register"><Button variant="gradient">Get Started</Button></Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="#features" className="block px-3 py-2 text-sm">Features</Link>
            <Link href="#pricing" className="block px-3 py-2 text-sm">Pricing</Link>
            <Link href="#faq" className="block px-3 py-2 text-sm">FAQ</Link>
            <div className="pt-2 space-y-2">
              {user ? (
                <Link href="/dashboard"><Button className="w-full">Dashboard</Button></Link>
              ) : (
                <>
                  <Link href="/auth/login"><Button variant="outline" className="w-full">Sign In</Button></Link>
                  <Link href="/auth/register"><Button className="w-full">Get Started</Button></Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
