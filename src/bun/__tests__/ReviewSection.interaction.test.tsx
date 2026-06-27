import { describe, expect, test, afterEach } from 'bun:test';
import { render, waitFor, act } from '@testing-library/react';
import ReviewSection from '../../mainview/sections/ReviewSection';
import { mockFetch, restoreFetch } from './mock-fetch';
import '../../mainview/i18n';

const mockCard = {
  id: 'test-1-q1',
  questionId: 'q1',
  moduleId: 1,
  courseId: 'test',
  question: 'What is 2+2?',
  answer: 'B. 4',
  explanation: 'Basic addition',
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  nextReviewDate: '2024-01-01T00:00:00.000Z',
  lastReviewed: null,
  isStarred: false,
};

const mockDeck = { cards: { 'test-1-q1': mockCard } };
const defaultProps = { courseId: 'test', onBack: () => {} };

afterEach(restoreFetch);

describe('ReviewSection interaction', () => {
  test('shows loading state initially', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<ReviewSection {...defaultProps} />));
    });
    expect(container.innerHTML).toMatchSnapshot();
  });

  test('shows question side with Show Answer button', async () => {
    mockFetch({ '/srs': mockDeck, '/filter': [mockCard] });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<ReviewSection {...defaultProps} />));
    });
    await waitFor(() => expect(container.textContent).toContain('Show Answer'));
  });

  test('shows empty deck message', async () => {
    mockFetch({ '/srs': { cards: {} } });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<ReviewSection {...defaultProps} />));
    });
    await waitFor(() => expect(container.textContent).toMatch(/no cards/i));
  });
});
