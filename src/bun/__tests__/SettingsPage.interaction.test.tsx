import { describe, expect, test, afterEach } from 'bun:test';
import { render, waitFor, act } from '@testing-library/react';
import SettingsPage from '../../mainview/pages/SettingsPage';
import { mockFetch, restoreFetch } from './mock-fetch';
import '../../mainview/i18n';

const defaultProps = { onBack: () => {} };
afterEach(restoreFetch);

describe('SettingsPage interaction', () => {
  test('shows loading or initial state', async () => {
    mockFetch({ '/gemini/key': { hasKey: false } });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<SettingsPage {...defaultProps} />));
    });
    expect(container.textContent).toMatch(/gemini|api|setting/i);
  });

  test('shows API key input when no key configured', async () => {
    mockFetch({ '/gemini/key': { hasKey: false } });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<SettingsPage {...defaultProps} />));
    });
    await waitFor(() => expect(container.textContent).toContain('Gemini API'));
    expect(container.innerHTML).toMatchSnapshot();
  });

  test('shows key configured message when key exists', async () => {
    mockFetch({ '/gemini/key': { hasKey: true } });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<SettingsPage {...defaultProps} />));
    });
    await waitFor(() => expect(container.textContent).toMatch(/configured|set up/i));
    expect(container.innerHTML).toMatchSnapshot();
  });
});
