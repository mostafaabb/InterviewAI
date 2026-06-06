"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { challenges } from "@/lib/api";
import { SUPPORTED_LANGUAGES } from "@/types";
import { Code, Play, CheckCircle2, Loader2, Terminal, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror").then((m) => m.default), { ssr: false });

export default function ChallengeDetailPage() {
  const params = useParams();
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cmTheme, setCmTheme] = useState<any>(null);
  const [cmExt, setCmExt] = useState<any>(null);

  useEffect(() => {
    loadChallenge();
    loadCodeMirror();
  }, []);

  useEffect(() => {
    loadExtension();
  }, [language]);

  const loadCodeMirror = async () => {
    const theme = await import("@codemirror/theme-one-dark").then((m) => m.oneDark);
    setCmTheme(() => theme);
  };

  const loadExtension = async () => {
    switch (language) {
      case "JavaScript":
      case "TypeScript": {
        const ext = await import("@codemirror/lang-javascript").then((m) => m.javascript);
        setCmExt(() => ext);
        break;
      }
      case "Python": {
        const ext = await import("@codemirror/lang-python").then((m) => m.python);
        setCmExt(() => ext);
        break;
      }
      default:
        setCmExt(null);
    }
  };

  const loadChallenge = async () => {
    try {
      const data = await challenges.getOne(params.id as string);
      if (typeof data.examples === "string") data.examples = JSON.parse(data.examples);
      setChallenge(data);
      setCode(data.boilerplate?.[language] || "// Write your solution here\n");
    } catch (error: any) {
      toast.error("Failed to load challenge");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const data = await challenges.submit(params.id as string, code, language);
      setResult(data.evaluation);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onChange = useCallback((val: string) => {
    setCode(val);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="h-screen flex flex-col">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Code className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{challenge?.title}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant={challenge?.difficulty === "EASY" ? "success" : challenge?.difficulty === "MEDIUM" ? "warning" : "destructive"}>{challenge?.difficulty}</Badge>
                  <Badge variant="secondary">{challenge?.category}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="h-9 px-3 rounded-lg border border-input bg-background text-sm">
                {SUPPORTED_LANGUAGES.map((lang) => (<option key={lang} value={lang}>{lang}</option>))}
              </select>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating...</> : <><Play className="mr-2 h-4 w-4" /> Submit</>}
              </Button>
            </div>
          </div>

          <div className="flex-1 flex">
            <div className="w-1/2 p-4 overflow-y-auto border-r border-border/50">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h2 className="text-lg font-semibold mb-3">Problem</h2>
                <p className="text-muted-foreground">{challenge?.description}</p>

                {challenge?.constraints && (
                  <>
                    <h3 className="font-semibold mt-4 mb-2">Constraints</h3>
                    <pre className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">{challenge.constraints}</pre>
                  </>
                )}

                {challenge?.examples && challenge.examples.length > 0 && (
                  <>
                    <h3 className="font-semibold mt-4 mb-2">Examples</h3>
                    {challenge.examples.map((ex: any, i: number) => (
                      <div key={i} className="mb-3 p-3 rounded-lg bg-muted">
                        <p className="text-sm"><strong>Input:</strong> {ex.input}</p>
                        <p className="text-sm"><strong>Output:</strong> {ex.output}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="w-1/2 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-hidden">
                {cmTheme && (
                  <CodeMirror
                    value={code}
                    height="100%"
                    theme={cmTheme}
                    extensions={cmExt ? [cmExt()] : []}
                    onChange={onChange}
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLineGutter: true,
                      highlightActiveLine: true,
                      foldGutter: true,
                      autocompletion: true,
                    }}
                    className="h-full [&_.cm-editor]:h-full [&_.cm-scroller]:h-full"
                  />
                )}
              </div>

              {result && (
                <div className="p-4 overflow-y-auto max-h-64 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className={`h-5 w-5 ${result.score >= 70 ? "text-green-500" : "text-yellow-500"}`} />
                    <span className="font-semibold">Score: {Math.round(result.score)}%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Correctness</p>
                      <p className="font-medium">{Math.round(result.correctness)}%</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Time Complexity</p>
                      <p className="font-medium">{result.timeComplexity}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Space Complexity</p>
                      <p className="font-medium">{result.spaceComplexity}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Readability</p>
                      <p className="font-medium">{Math.round(result.readability)}%</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">{result.feedback}</p>

                  {result.improvements?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Improvements:</p>
                      <ul className="space-y-1">
                        {result.improvements.map((imp: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
