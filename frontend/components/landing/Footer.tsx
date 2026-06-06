import { Sparkles } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">InterviewAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Master technical interviews with AI-powered practice and feedback.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features">Features</Link></li>
              <li><Link href="#pricing">Pricing</Link></li>
              <li><Link href="/auth/register">Sign Up</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-pointer">Documentation</span></li>
              <li><span className="cursor-pointer">API Reference</span></li>
              <li><span className="cursor-pointer">Blog</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-pointer">About</span></li>
              <li><span className="cursor-pointer">Privacy</span></li>
              <li><span className="cursor-pointer">Terms</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} InterviewAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
