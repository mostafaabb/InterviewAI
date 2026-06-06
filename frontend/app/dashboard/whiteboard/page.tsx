"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/PageTransition";
import { fetchAPI } from "@/lib/api";
import toast from "react-hot-toast";

type Tool = "pen" | "rect" | "circle" | "line";
type Shape = { type: Tool; x: number; y: number; w?: number; h?: number; color: string; size: number };

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#6366f1");
  const [size, setSize] = useState(3);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [redoStack, setRedoStack] = useState<Shape[]>([]);
  const [boardName, setBoardName] = useState("System Design Diagram");
  const [saving, setSaving] = useState(false);
  const [savedBoards, setSavedBoards] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    redraw();
  }, [shapes, color, size]);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    redraw();
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "hsl(var(--background))";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((s) => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.size;
      ctx.beginPath();
      switch (s.type) {
        case "pen":
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
          break;
        case "rect":
          ctx.strokeRect(s.x, s.y, s.w || 0, s.h || 0);
          break;
        case "circle":
          const r = Math.sqrt(((s.w || 0) ** 2 + (s.h || 0) ** 2));
          ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case "line":
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + (s.w || 0), s.y + (s.h || 0));
          ctx.stroke();
          break;
      }
    });
  }, [shapes]);

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getPos(e);
    setDrawing(true);
    setStartPos(pos);
    if (tool === "pen") {
      const newShape: Shape = { type: "pen", x: pos.x, y: pos.y, color, size };
      setShapes((prev) => [...prev, newShape]);
      setRedoStack([]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const pos = getPos(e);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    if (tool === "pen") {
      const last = shapes[shapes.length - 1];
      if (last && last.type === "pen") {
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        last.x = pos.x;
        last.y = pos.y;
      }
      setShapes([...shapes]);
    } else {
      redraw();
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.beginPath();
      switch (tool) {
        case "rect":
          ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
          break;
        case "circle":
          const r = Math.sqrt((pos.x - startPos.x) ** 2 + (pos.y - startPos.y) ** 2);
          ctx.arc(startPos.x, startPos.y, r, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case "line":
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
          break;
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!drawing) return;
    setDrawing(false);
    const pos = getPos(e);
    if (tool !== "pen") {
      const newShape: Shape = { type: tool, x: startPos.x, y: startPos.y, w: pos.x - startPos.x, h: pos.y - startPos.y, color, size };
      setShapes((prev) => [...prev, newShape]);
      setRedoStack([]);
    }
  };

  const undo = () => {
    if (shapes.length === 0) return;
    setRedoStack((prev) => [shapes[shapes.length - 1], ...prev]);
    setShapes((prev) => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    setShapes((prev) => [...prev, redoStack[0]]);
    setRedoStack((prev) => prev.slice(1));
  };

  const clear = () => {
    setShapes([]);
    setRedoStack([]);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${boardName.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const save = async () => {
    setSaving(true);
    try {
      const data = await fetchAPI("/whiteboards", {
        method: "POST",
        body: { name: boardName, data: shapes, type: "system-design" },
      });
      toast.success("Whiteboard saved!");
      setSavedBoards((prev) => [data, ...prev]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const loadBoards = async () => {
    try {
      const data = await fetchAPI("/whiteboards");
      setSavedBoards(data);
      setShowSaved(!showSaved);
    } catch { toast.error("Failed to load boards"); }
  };

  const toolIcons: Record<Tool, string> = { pen: "✏️", rect: "▭", circle: "○", line: "╱" };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="flex flex-col h-[calc(100vh-0px)]">
          <div className="p-3 border-b border-border/50 flex items-center justify-between bg-background/95 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="text-primary">✏️</span>
              <Input value={boardName} onChange={(e) => setBoardName(e.target.value)} className="h-8 w-52 text-sm" />
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 mr-2 p-1 rounded-lg bg-muted">
                {(["pen", "rect", "circle", "line"] as Tool[]).map((t) => (
                  <button key={t} onClick={() => setTool(t)}
                    className={`p-1.5 rounded-md text-xs ${tool === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {toolIcons[t]}
                  </button>
                ))}
              </div>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 p-0.5" />
              <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="h-7 w-16 rounded border border-input bg-background text-xs px-1">
                {[1, 2, 3, 5, 8].map((s) => <option key={s} value={s}>{s}px</option>)}
              </select>
              <div className="w-px h-6 bg-border mx-1" />
              <button onClick={undo} disabled={shapes.length === 0} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30" title="Undo">↩</button>
              <button onClick={redo} disabled={redoStack.length === 0} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30" title="Redo">↪</button>
              <button onClick={clear} disabled={shapes.length === 0} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30" title="Clear">🗑</button>
              <div className="w-px h-6 bg-border mx-1" />
              <button onClick={download} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground" title="Download">⬇</button>
              <Button variant="outline" size="sm" onClick={save} disabled={saving} className="h-7 text-xs">
                {saving ? "..." : "💾"} Save
              </Button>
              <Button variant="ghost" size="sm" onClick={loadBoards} className="h-7 text-xs">Saved</Button>
            </div>
          </div>

          {showSaved && savedBoards.length > 0 && (
            <div className="p-2 border-b border-border/50 bg-muted/30 flex gap-2 overflow-x-auto">
              {savedBoards.map((b: any) => (
                <button key={b.id} onClick={() => { setBoardName(b.name); setShapes(b.data || []); setShowSaved(false); }}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-background border border-border text-xs hover:border-primary transition-colors">
                  {b.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-hidden bg-muted/20">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setDrawing(false)}
              className="w-full h-full cursor-crosshair"
            />
          </div>
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
