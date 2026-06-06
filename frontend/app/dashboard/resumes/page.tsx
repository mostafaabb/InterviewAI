"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resumes } from "@/lib/api";
import { Upload, Loader2, CheckCircle2, AlertCircle, XCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function ResumesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const data = await resumes.upload(file);
      setResult(data.analysis || data.resume);
      toast.success("Resume analyzed!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Resume Analyzer</h1>
            <p className="text-muted-foreground mt-1">Upload your resume for AI-powered ATS analysis</p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Upload className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Upload your resume (PDF)</p>
                <p className="text-xs text-muted-foreground mb-4">Max 10MB</p>
                <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="resume-upload" />
                <label htmlFor="resume-upload">
                  <Button variant="outline" asChild><span>Choose File</span></Button>
                </label>
                {file && <p className="text-sm mt-2">{file.name}</p>}
              </div>
              {file && (
                <Button onClick={handleUpload} disabled={uploading} className="w-full mt-4">
                  {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Analyze Resume"}
                </Button>
              )}
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-6">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">ATS Compatibility Score</p>
                      <p className="text-4xl font-bold">{Math.round(result.atsScore)}%</p>
                    </div>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white ${result.atsScore >= 80 ? "bg-green-500" : result.atsScore >= 60 ? "bg-yellow-500" : "bg-red-500"}`}>
                      {result.atsScore >= 80 ? "A" : result.atsScore >= 60 ? "B" : "C"}
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${result.atsScore >= 80 ? "bg-green-500" : result.atsScore >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${result.atsScore}%` }} />
                  </div>
                </CardContent>
              </Card>

              {result.missingKeywords?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center"><XCircle className="mr-2 h-5 w-5 text-red-500" /> Missing Keywords</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">Your resume is missing these important keywords:</p>
                    <div className="flex flex-wrap gap-2">{result.missingKeywords.map((k: string) => <Badge key={k} variant="destructive">{k}</Badge>)}</div>
                  </CardContent>
                </Card>
              )}

              {result.weakPoints?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center"><AlertCircle className="mr-2 h-5 w-5 text-yellow-500" /> Weak Points & Gaps</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">Areas that need improvement:</p>
                    <ul className="space-y-2">
                      {result.weakPoints.map((w: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {result.formattingIssues?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center"><XCircle className="mr-2 h-5 w-5 text-orange-500" /> Formatting Issues</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">Fix these formatting problems:</p>
                    <ul className="space-y-2">
                      {result.formattingIssues.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted">
                          <XCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {result.suggestions?.length > 0 && (
                <Card className="border-primary/20">
                  <CardHeader><CardTitle className="text-lg flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-green-500" /> Actionable Suggestions</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">Follow these tips to improve your resume:</p>
                    <ul className="space-y-2">
                      {result.suggestions.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted">
                          <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
