"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { interviews } from "@/lib/api";
import { formatDate, getScoreColor, getScoreGradient } from "@/lib/utils";
import { Send, Mic, Square, Loader2, Bot, User, BarChart3, CheckCircle2, XCircle, AlertCircle, StopCircle, Volume2, Timer as TimerIcon } from "lucide-react";
import toast from "react-hot-toast";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function InterviewSessionPage() {
  const params = useParams();
  const [interview, setInterview] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [ended, setEnded] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(45 * 60);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [timerActive, setTimerActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const playSound = (type: 'send' | 'recv' | 'end') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0.1;
      if (type === 'send') { osc.frequency.value = 800; osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08); }
      if (type === 'recv') { osc.frequency.value = 600; osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1); }
      if (type === 'end') { osc.frequency.value = 400; osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3); }
    } catch {}
  };

  const SpeechRecognition = typeof window !== "undefined"
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

  useEffect(() => {
    loadInterview();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) { clearInterval(timerRef.current); handleEnd(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSend(); }
      if (e.key === 'Escape' && recording) { stopRecording(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, recording, transcript]);

  const parseReport = (r: any) => {
    if (!r) return r;
    return {
      ...r,
      strengths: typeof r.strengths === "string" ? JSON.parse(r.strengths) : r.strengths,
      weaknesses: typeof r.weaknesses === "string" ? JSON.parse(r.weaknesses) : r.weaknesses,
      recommendations: typeof r.recommendations === "string" ? JSON.parse(r.recommendations) : r.recommendations,
    };
  };

  const loadInterview = async () => {
    try {
      const data = await interviews.getOne(params.id as string);
      setInterview(data);
      setMessages(data.messages || []);
      if (data.timed === "true") setTimerActive(true);
      if (data.status === "COMPLETED") {
        setEnded(true);
        setReport(parseReport(data.report));
      }
    } catch (error: any) {
      toast.error("Failed to load interview");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim() || transcript.trim();
    if (!text) return;
    const userMessage = { role: "user", content: text, id: Date.now().toString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTranscript("");
    setSending(true);

    try {
      const data = await interviews.sendMessage(params.id as string, text);
      setMessages((prev) => [...prev, data]);
      playSound('recv');
    } catch (error: any) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleEnd = async () => {
    setSending(true);
    clearInterval(timerRef.current);
    try {
      const data = await interviews.end(params.id as string);
      setReport(parseReport(data.report));
      setEnded(true);
      setTimerActive(false);
      playSound('end');
      toast.success("Interview completed!");
    } catch (error: any) {
      toast.error("Failed to end interview");
    } finally {
      setSending(false);
    }
  };

  const startRecording = () => {
    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported in this browser. Try Chrome.");
      return;
    }
    try {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const recorder = new MediaRecorder(stream);
        audioChunksRef.current = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setAudioBlob(blob);
          stream.getTracks().forEach((t) => t.stop());
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
      }).catch(() => {});
    } catch {}
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(final || interim);
    };

    recognition.onerror = () => {
      setRecording(false);
      toast.error("Voice recognition error. Try again.");
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
    setTranscript("");
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setRecording(false);
  };

  const toggleAudioPlayback = () => {
    if (!audioUrl) return;
    if (audioPlaying) { window.speechSynthesis.cancel(); setAudioPlaying(false); return; }
    const audio = new Audio(audioUrl);
    audio.onended = () => setAudioPlaying(false);
    audio.play();
    setAudioPlaying(true);
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => setSpeaking(null);
      setSpeaking(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (ended && report) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:pl-64">
          <PageTransition>
          <div className="p-6 lg:p-8 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Interview Complete</h1>
              <p className="text-muted-foreground mt-1">{formatDate(interview.createdAt)}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold mb-2">{Math.round(report.overallScore)}</div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold mb-2">{interview.category}</div>
                  <p className="text-sm text-muted-foreground">Category</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold mb-2">{interview.type}</div>
                  <p className="text-sm text-muted-foreground">Interview Type</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader><CardTitle>Score Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Communication", value: report.communication },
                    { label: "Technical Accuracy", value: report.technicalAccuracy },
                    { label: "Problem Solving", value: report.problemSolving },
                    { label: "Confidence", value: report.confidence },
                    { label: "Clarity", value: report.clarity },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.label}</span>
                        <span className={getScoreColor(item.value)}>{Math.round(item.value)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(item.value)} transition-all`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-green-500" /> Strengths</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />{s}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><AlertCircle className="mr-2 h-5 w-5 text-yellow-500" /> Areas to Improve</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.weaknesses?.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm"><XCircle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />{w}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.recommendations?.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />{r}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{report.summary}</p>
              </CardContent>
            </Card>
          </div>
          </PageTransition>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
          <PageTransition>
          <div className="h-screen flex flex-col">
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-background/95 backdrop-blur-xl">
            <div className="flex items-center space-x-3">
              <Mic className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{interview?.category} Interview</p>
                <p className="text-xs text-muted-foreground">{interview?.difficulty} • {interview?.type} • {interview?.style || 'faang'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {timerActive && (
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${timer < 300 ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-muted"}`}>
                  <TimerIcon className="h-3 w-3" />
                  {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                </div>
              )}
              <Button variant="destructive" size="sm" onClick={handleEnd} disabled={sending}>
                <Square className="mr-2 h-4 w-4" /> End Interview
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4">
            {messages.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-start gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-primary/20" : "bg-accent"
                  }`}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                  </div>
                  <div className={`p-4 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent border border-border/50"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.role !== "user" && (
                      <button
                        onClick={() => speakText(msg.content)}
                        className="mt-2 text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        <Volume2 className="h-3 w-3" /> {speaking === msg.content ? "Playing..." : "Read aloud"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="p-4 rounded-xl bg-accent border border-border/50">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <div className="flex-1 flex items-center gap-2 h-12 px-4 rounded-xl border border-input bg-background text-sm focus-within:ring-2 focus-within:ring-ring">
                <input
                  value={recording ? transcript : input}
                  onChange={(e) => { if (!recording) setInput(e.target.value); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={recording ? "Listening..." : "Type your answer..."}
                  className="flex-1 bg-transparent outline-none"
                  disabled={sending}
                />
                {recording && (
                  <span className="flex items-center gap-1 text-xs text-red-500">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Recording
                  </span>
                )}
                {audioUrl && !recording && (
                  <button onClick={toggleAudioPlayback} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                    🎧 {audioPlaying ? "Playing" : "Play last"}
                  </button>
                )}
              </div>
              <Button
                variant={recording ? "destructive" : "outline"}
                onClick={recording ? stopRecording : startRecording}
                disabled={sending}
                className="px-3"
              >
                {recording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button onClick={handleSend} disabled={sending || (!input.trim() && !transcript.trim())}>
                <Send className="h-4 w-4" />
              </Button>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground bg-muted rounded border">⌘+Enter</kbd>
            </div>
          </div>
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
