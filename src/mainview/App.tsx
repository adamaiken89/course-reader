import { useState } from "react";
import SubjectListView from "./components/SubjectListView";
import LessonView from "./components/LessonView";
import QuizView from "./components/QuizView";
import ReviewView from "./components/ReviewView";
import SettingsView from "./components/SettingsView";
import { api } from "./api";

interface Subject {
  id: string;
  subject: string;
  displayName: string;
  modules: { id: number; name: string; timeHours: number; prerequisites: number[] }[];
  timeBudgetHours: number;
  targetLevel: string;
  learningObjectives: string[];
}

interface ModuleMeta {
  id: number;
  name: string;
  timeHours: number;
  prerequisites: number[];
}

interface Bookmark {
  id: string;
  subjectID: string;
  moduleID: number;
  title: string;
  createdAt: string;
}

type View =
  | { type: "subjectList" }
  | { type: "lesson"; subject: Subject; module: ModuleMeta }
  | { type: "quiz"; subject: Subject; module: ModuleMeta }
  | { type: "review"; subject: Subject }
  | { type: "settings" }
  | { type: "bookmarks" };

export default function App() {
  const [viewStack, setViewStack] = useState<View[]>([{ type: "subjectList" }]);

  const pushView = (view: View) => setViewStack((v) => [...v, view]);
  const popView = () => setViewStack((v) => v.slice(0, -1));
  const popToRoot = () => setViewStack([{ type: "subjectList" }]);

  const currentView = viewStack[viewStack.length - 1];

  const handleSelectSubject = async (subject: Subject) => {
    pushView({ type: "lesson", subject, module: subject.modules[0] });
  };

  const handleSelectModule = (subject: Subject, module: ModuleMeta) => {
    pushView({ type: "lesson", subject, module });
  };

  const handleStartQuiz = (subject: Subject, module: ModuleMeta) => {
    pushView({ type: "quiz", subject, module });
  };

  const handleStartReview = (subject: Subject) => {
    pushView({ type: "review", subject });
  };

  switch (currentView.type) {
    case "subjectList":
      return (
        <SubjectListView
          onSelectSubject={handleSelectSubject}
          onOpenSettings={() => pushView({ type: "settings" })}
          onOpenBookmarks={() => pushView({ type: "bookmarks" })}
        />
      );

    case "lesson":
      return (
        <LessonPage
          subject={currentView.subject}
          module={currentView.module}
          onBack={popView}
          onSelectModule={(m) => handleSelectModule(currentView.subject, m)}
          onStartQuiz={() => handleStartQuiz(currentView.subject, currentView.module)}
          onStartReview={() => handleStartReview(currentView.subject)}
        />
      );

    case "quiz":
      return (
        <QuizView
          subjectId={currentView.subject.id}
          moduleId={currentView.module.id}
          onBack={popView}
        />
      );

    case "review":
      return (
        <ReviewView
          subjectId={currentView.subject.id}
          onBack={popView}
        />
      );

    case "settings":
      return <SettingsView onBack={popView} />;

    case "bookmarks":
      return <BookmarksView onBack={popView} onOpen={(subjectID, moduleID, subjects) => {
        const subject = subjects.find((s: Subject) => s.id === subjectID);
        const module = subject?.modules.find((m) => m.id === moduleID);
        if (subject && module) {
          setViewStack([{ type: "subjectList" }, { type: "lesson", subject, module }]);
        }
      }} />;
  }
}

function LessonPage({
  subject, module, onBack, onSelectModule, onStartQuiz, onStartReview,
}: {
  subject: Subject;
  module: ModuleMeta;
  onBack: () => void;
  onSelectModule: (m: ModuleMeta) => void;
  onStartQuiz: () => void;
  onStartReview: () => void;
}) {
  const [showNav, setShowNav] = useState(false);
  const currentIdx = subject.modules.findIndex((m) => m.id === module.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < subject.modules.length - 1;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Module navigation sidebar */}
      {showNav && (
        <aside className="w-64 bg-gray-850 border-r border-gray-700 overflow-y-auto shrink-0">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-indigo-400">{subject.displayName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{subject.modules.length} modules</p>
          </div>
          <div className="p-2">
            {subject.modules.map((m, i) => (
              <button
                key={m.id}
                onClick={() => { onSelectModule(m); setShowNav(false); }}
                className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                  m.id === module.id
                    ? "bg-indigo-600/20 text-indigo-300"
                    : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                }`}
              >
                <span className="text-xs text-gray-500 mr-2">{String(i + 1).padStart(2, "0")}</span>
                <span className="truncate">{m.name}</span>
              </button>
            ))}
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Subject header bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">← Back</button>
            <div className="h-4 w-px bg-gray-600" />
            <button onClick={() => setShowNav(!showNav)} className={`px-2 py-1 text-xs rounded ${showNav ? "bg-indigo-600" : "bg-gray-700 hover:bg-gray-600"}`}>
              Modules
            </button>
          </div>
          <div className="flex-1 text-center">
            <span className="text-sm font-medium truncate inline-block max-w-md">{module.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {hasPrev && (
              <button onClick={() => onSelectModule(subject.modules[currentIdx - 1])} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded">← Prev</button>
            )}
            {hasNext && (
              <button onClick={() => onSelectModule(subject.modules[currentIdx + 1])} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded">Next →</button>
            )}
            <div className="h-4 w-px bg-gray-600" />
            <button onClick={onStartReview} className="px-3 py-1 text-sm bg-amber-700 hover:bg-amber-600 rounded transition-colors">
              Review
            </button>
          </div>
        </header>

        <LessonView
          subjectId={subject.id}
          module={module}
          onBack={onBack}
          onStartQuiz={onStartQuiz}
        />
      </div>
    </div>
  );
}

function BookmarksView({ onBack, onOpen }: {
  onBack: () => void;
  onOpen: (subjectID: string, moduleID: number, subjects: Subject[]) => void;
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    Promise.all([
      api.storage.bookmarks(),
      api.subjects.list(),
    ]).then(([bks, subs]) => {
      setBookmarks(bks);
      setSubjects(subs);
      setLoading(false);
    });
  });

  if (loading) return <div className="p-8 text-center text-gray-400">Loading bookmarks...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">← Back</button>
        <h2 className="text-sm font-medium">Bookmarks</h2>
        <div className="w-16" />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {bookmarks.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No bookmarks yet. Bookmark lessons while reading.</p>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((b) => (
              <button
                key={b.id}
                onClick={() => onOpen(b.subjectID, b.moduleID, subjects)}
                className="w-full text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl p-4 transition-colors"
              >
                <h3 className="text-sm font-medium text-indigo-300">{b.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Subject: {subjects.find((s) => s.id === b.subjectID)?.displayName || b.subjectID}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{new Date(b.createdAt).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
