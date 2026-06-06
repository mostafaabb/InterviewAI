"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/api";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      auth.verifyEmail(token)
        .then(() => setStatus("success"))
        .catch(() => setStatus("error"));
    } else {
      setStatus("error");
    }
  }, []);

  return (
    <Card className="w-full max-w-md glass">
      <CardContent className="text-center py-8">
        {status === "loading" && (
          <><Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-3" /><p>Verifying your email...</p></>
        )}
        {status === "success" && (
          <><CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" /><h2 className="text-xl font-bold mb-2">Email Verified!</h2><p className="text-muted-foreground mb-4">Your email has been verified successfully.</p><Link href="/dashboard"><Button>Go to Dashboard</Button></Link></>
        )}
        {status === "error" && (
          <><XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" /><h2 className="text-xl font-bold mb-2">Verification Failed</h2><p className="text-muted-foreground mb-4">Invalid or expired verification link.</p><Link href="/auth/login"><Button variant="outline">Back to Login</Button></Link></>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md glass">
          <CardContent className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-3" />
            <p>Verifying your email...</p>
          </CardContent>
        </Card>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
