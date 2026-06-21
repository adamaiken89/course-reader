import { useState, useEffect, useRef, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { api } from "../api";

interface ModuleMeta {
  id: number;
  name: string;
  timeHours: number;
  prerequisites: number[];
}

interface Section {
  id: string;
  heading: string;
  level: number;
  parentID: string | null;
}

interface Props {
  subjectId: string;
  module: ModuleMeta;
  onStartQuiz: () => void;
}

function extractText(children: ReactNode): string {
  let text = "";
  const walk = (node: ReactNode) => {
    if (typeof node === "string") text += node;
    else if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === "object" && "props" in node) {
      walk((node as { props: { children: ReactNode } }).props.children);
    }
  };
  walk(children);
  return text;
}

function headingId(children: ReactNode): string {
  return extractText(children)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[:,()]/g, "")
    .replace(/[^a-z0-9-]/g, "");
}

const headingRenderer = (level: number) =>
  function Heading({ children }: { children: ReactNode }) {
    const id = headingId(children);
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    return <Tag id={id}>{children}</Tag>;
  };

const components = {
  h1: headingRenderer(1),
  h2: headingRenderer(2),
  h3: headingRenderer(3),
  h4: headingRenderer(4),
  h5: headingRenderer(5),
  h6: headingRenderer(6),
};

type Theme = "dark" | "sepia" | "light";

const THEMES: Theme[] = ["dark", "sepia", "light"];
const THEME_LABELS: Record<Theme, string> = { dark: "Dark", sepia: "Sepia", light: "Light" };
const THEME_ICONS: Record<Theme, string> = { dark: "🌙", sepia: "📜", light: "☀️" };

function getStoredTheme(): Theme {
  try { return (localStorage.getItem("coursereader-theme") as Theme) || "dark"; } catch { return "dark"; }
}

function storeTheme(t: Theme) {
  try { localStorage.setItem("coursereader-theme", t); } catch { /* noop */ }
}

export default function LessonView({ subjectId, module, onStartQuiz }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [visibleSection, setVisibleSection] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const cycleTheme = () => {
    setTheme((prev) => {
      const idx = THEMES.indexOf(prev);
      const next = THEMES[(idx + 1) % THEMES.length];
      storeTheme(next);
      return next;
    });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.subjects.lesson(subjectId, module.id),
      api.subjects.sections(subjectId, module.id),
      api.storage.notes(subjectId, module.id),
    ]).then(([lesson, secs, nts]) => {
      setContent(lesson.content);
      setSections(secs);
      setNotes(nts);
      setLoading(false);
    });
  }, [subjectId, module.id]);

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    setAiThinking(true);
    setAiResponse("");
    try {
      const result = await api.gemini.ask(aiQuestion, content.slice(0, 4000));
      setAiResponse(result.response);
    } catch (err) {
      setAiResponse(`Error: ${(err as Error).message}`);
    }
    setAiThinking(false);
  };

  const handleScroll = () => {
    if (!contentRef.current || sections.length === 0) return;
    const headings = contentRef.current.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let currentId: string | null = null;
    headings.forEach((h) => {
      const rect = h.getBoundingClientRect();
      if (rect.top < 150) currentId = h.id;
    });
    setVisibleSection(currentId);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollSection = (dir: "prev" | "next") => {
    if (!visibleSection) return;
    const idx = sections.findIndex((s) => s.id === visibleSection);
    const target = dir === "next" ? idx + 1 : idx - 1;
    if (target >= 0 && target < sections.length) scrollToSection(sections[target].id);
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading lesson...</div>;

  const hasPrevSection = sections.length > 0 && visibleSection !== null && sections.findIndex((s) => s.id === visibleSection) > 0;
  const hasNextSection = sections.length > 0 && visibleSection !== null && sections.findIndex((s) => s.id === visibleSection) < sections.length - 1;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Lesson content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Floating toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-1.5 flex items-center gap-2 shrink-0">
          <button onClick={() => setFontSize((f) => Math.max(10, f - 2))} className="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 rounded" title="Decrease font size">A-</button>
          <span className="text-xs text-gray-400 w-8 text-center">{fontSize}</span>
          <button onClick={() => setFontSize((f) => Math.min(28, f + 2))} className="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 rounded" title="Increase font size">A+</button>
          <div className="h-3 w-px bg-gray-600" />
          <button onClick={cycleTheme} className="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 rounded" title={`Theme: ${THEME_LABELS[theme]}`}>
            {THEME_ICONS[theme]}
          </button>
          <div className="h-3 w-px bg-gray-600" />
          <button onClick={() => scrollSection("prev")} disabled={!hasPrevSection} className="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-30">↑ Sec</button>
          <button onClick={() => scrollSection("next")} disabled={!hasNextSection} className="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-30">↓ Sec</button>
          <div className="h-3 w-px bg-gray-600" />
          <button onClick={() => setShowSidebar(!showSidebar)} className={`px-2 py-0.5 text-xs rounded ${showSidebar ? "bg-indigo-600 text-white" : "bg-gray-700 hover:bg-gray-600"}`}>
            Notes ({notes.length})
          </button>
          <button onClick={() => setShowAI(!showAI)} className={`px-2 py-0.5 text-xs rounded ${showAI ? "bg-indigo-600 text-white" : "bg-gray-700 hover:bg-gray-600"}`}>
            Ask AI
          </button>
          <div className="flex-1" />
          <button onClick={onStartQuiz} className="px-3 py-0.5 text-xs bg-emerald-700 hover:bg-emerald-600 rounded">
            Quiz
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6" ref={contentRef} onScroll={handleScroll}>
          <div className={`book-content book-${theme}`} style={{ fontSize: `${fontSize}px` }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={components}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Notes sidebar */}
      {showSidebar && (
        <aside className="w-64 bg-gray-850 border-l border-gray-700 overflow-y-auto p-3 shrink-0">
          <h3 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">Notes ({notes.length})</h3>
          {notes.length === 0 && <p className="text-xs text-gray-500">No notes yet.</p>}
          {notes.map((note) => (
            <div key={note.id} className="bg-gray-800 rounded p-2 mb-1.5">
              <p className="text-xs text-gray-300">{note.content}</p>
              <p className="text-xs text-gray-600 mt-0.5">{new Date(note.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </aside>
      )}

      {/* AI sidebar */}
      {showAI && (
        <aside className="w-72 bg-gray-850 border-l border-gray-700 overflow-y-auto p-3 shrink-0 flex flex-col">
          <h3 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">Ask AI</h3>
          <textarea
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Ask about this lesson..."
            className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-xs text-gray-200 placeholder-gray-500 resize-none h-16 mb-1.5"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAskAI(); } }}
          />
          <button
            onClick={handleAskAI}
            disabled={aiThinking || !aiQuestion.trim()}
            className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 rounded disabled:opacity-50 mb-2"
          >
            {aiThinking ? "Thinking..." : "Ask"}
          </button>
          {aiResponse && (
            <div className="bg-gray-800 rounded p-2 text-xs text-gray-300 whitespace-pre-wrap">
              {aiResponse}
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
