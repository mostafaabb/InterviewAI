"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard, Mic, Code, FileText, BarChart3, Trophy,
  Settings, LogOut, Sparkles, Menu, X, Briefcase, UserCircle, Building, TrendingUp,
  BookOpen, Users, Star, Zap, Medal, Calendar, File, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/interviews", label: "AI Interviews", icon: Mic },
  { href: "/challenges", label: "Challenges", icon: Code },
  { href: "/dashboard/resumes", label: "Resume Analyzer", icon: FileText },
  { href: "/dashboard/job-description", label: "Job Analyzer", icon: Briefcase },
  { href: "/dashboard/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/dashboard/company-prep", label: "Company Prep", icon: Building },
  { href: "/dashboard/progress", label: "Progress", icon: BarChart3 },
  { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
  { href: "/dashboard/learning-path", label: "Learning Path", icon: BookOpen },
  { href: "/dashboard/whiteboard", label: "Whiteboard", icon: Layers },
  { href: "/dashboard/peer-matching", label: "Peer Practice", icon: Users },
  { href: "/dashboard/star-builder", label: "STAR Builder", icon: Star },
  { href: "/dashboard/company-insights", label: "Company Intel", icon: Zap },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Medal },
  { href: "/dashboard/study-plan", label: "Study Timeline", icon: Calendar },
  { href: "/dashboard/resume-builder", label: "Resume Builder", icon: File },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-background border">
        <Menu className="h-5 w-5" />
      </button>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-border/50 bg-background/95 backdrop-blur-xl flex flex-col transition-transform duration-200 lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold">InterviewAI</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                pathname === item.href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                pathname.startsWith("/admin")
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <UserCircle className="h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.plan} Plan</p>
            </div>
          </div>
          <div className="space-y-1">
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => { logout(); router.push("/auth/login"); }}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
