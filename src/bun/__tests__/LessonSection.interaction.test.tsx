import { describe, expect, test, afterEach, beforeEach } from 'bun:test';
import { render, act } from '@testing-library/react';
import LessonSection from '../../mainview/sections/LessonSection';
import { useSettingsStore } from '../../mainview/stores/settingsStore';
import { processLessonMarkdown } from '../lesson-markdown';
import { restoreFetch } from './mock-fetch';
import '../../mainview/i18n';

beforeEach(() => {
  localStorage.removeItem('coursereader-focus');
  localStorage.removeItem('coursereader-sections');
  useSettingsStore.setState({ focusMode: false, showSections: false });
});

const mockContent = `# Introduction\n\nEst. study time: 2h\nLanguage: en\n\nWelcome to the lesson.\n\n## Chapter 1\n\nFirst chapter content.`;
const processed = processLessonMarkdown(mockContent);

const defaultProps = {
  courseId: 'test',
  courseName: 'Test Course',
  module: { id: 1, name: 'Intro Module', timeHours: 2, prerequisites: [], topics: [] },
  content: mockContent,
  h1: processed.h1,
  meta: processed.meta,
  bodyContent: processed.bodyContent,
  loading: false,
  sections: processed.sections,
  visibleSection: null,
  isCompleted: false,
  contentRef: { current: null } as unknown as React.RefObject<HTMLDivElement>,
  scrollToSection: () => {},
  handleScroll: () => {},
  handleToggleCompleted: async () => {},
  bookmarks: [],
  highlights: [],
  addHighlight: async () => {},
  deleteHighlight: async () => {},
  onToggleBookmark: async () => {},
  showTools: false,
  showPomodoro: false,
  setShowTools: () => {},
  showSections: false,
  onToggleSections: () => {},
};

afterEach(restoreFetch);

describe('LessonSection interaction', () => {
  test('renders h1 title', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<LessonSection {...defaultProps} />));
    });
    expect(container.textContent).toContain('Introduction');
  });

  test('renders mark as complete button', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<LessonSection {...defaultProps} />));
    });
    const btn = container.querySelector('button.w-full');
    expect(btn).not.toBeNull();
  });

  test('shows meta info', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<LessonSection {...defaultProps} />));
    });
    expect(container.querySelector('.lesson-meta')).not.toBeNull();
  });

  test('shows sections panel when showSections is true', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<LessonSection {...defaultProps} showSections={true} />));
    });
    const sectionsPanel = container.querySelector('.fixed');
    expect(sectionsPanel).not.toBeNull();
  });

  test('loading state shows loading text', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<LessonSection {...defaultProps} loading={true} />));
    });
    expect(container.textContent).toMatch(/loading/i);
  });
});
