import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { useSyncStore } from '../../mainview/stores/syncStore';
import { mockFetch, restoreFetch } from './mock-fetch';

beforeEach(() => {
  useSyncStore.setState(useSyncStore.getInitialState());
});

afterEach(restoreFetch);

describe('syncStore', () => {
  test('default state', () => {
    const s = useSyncStore.getState();
    expect(s.lastSyncTime).toBeNull();
    expect(s.lastSyncedCommit).toBeNull();
    expect(s.isSyncing).toBe(false);
    expect(s.remoteRepoURL).toBe('');
    expect(s.error).toBeNull();
  });

  test('loadStatus fetches and populates state', async () => {
    mockFetch({
      '/sync/status': {
        lastSyncTime: '2024-01-01T00:00:00Z',
        lastSyncedCommit: 'abc123',
        isSyncing: false,
        remoteRepoURL: 'https://github.com/user/repo',
      },
    });
    await useSyncStore.getState().loadStatus();
    const s = useSyncStore.getState();
    expect(s.lastSyncTime).toBe('2024-01-01T00:00:00Z');
    expect(s.lastSyncedCommit).toBe('abc123');
    expect(s.remoteRepoURL).toBe('https://github.com/user/repo');
  });

  test('startSync updates lastSyncTime on success', async () => {
    mockFetch({
      '/sync/start': { success: true, commitHash: 'def456', message: 'Synced' },
    });
    await useSyncStore.getState().startSync();
    const s = useSyncStore.getState();
    expect(s.lastSyncedCommit).toBe('def456');
    expect(s.isSyncing).toBe(false);
  });

  test('startSync guard prevents concurrent sync', async () => {
    useSyncStore.setState({ isSyncing: true });
    let started = false;
    const origFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      started = true;
      return new Response('{}');
    }) as unknown as typeof globalThis.fetch;
    await useSyncStore.getState().startSync();
    expect(started).toBe(false);
    globalThis.fetch = origFetch;
  });

  test('setRepoURL sets URL via API', async () => {
    mockFetch({ '/sync/config': { ok: true } });
    await useSyncStore.getState().setRepoURL('https://github.com/user/new-repo');
    expect(useSyncStore.getState().remoteRepoURL).toBe('https://github.com/user/new-repo');
  });

  test('setRepoURL sets error on failure', async () => {
    globalThis.fetch = (async () =>
      new Response(null, { status: 500 })) as unknown as typeof globalThis.fetch;
    await useSyncStore.getState().setRepoURL('https://github.com/user/repo');
    expect(useSyncStore.getState().error).toBeTruthy();
    expect(useSyncStore.getState().remoteRepoURL).toBe(''); // not updated
  });
});
