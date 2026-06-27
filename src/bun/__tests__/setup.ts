import { afterEach } from 'bun:test';
import { cleanup } from '@testing-library/react';

// Silence module-init console noise (Gemini, storage, i18n side effects)
const _warn = console.warn;
const _error = console.error;
const _log = console.log;
console.warn = () => {};
console.error = () => {};
console.log = () => {};
import '../../mainview/i18n';
console.warn = _warn;
console.error = _error;
console.log = _log;

import { Window } from 'happy-dom';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const win = new Window() as unknown as Window & typeof globalThis;

(globalThis as any).window = win;
(globalThis as any).document = win.document;
(globalThis as any).self = win;
(globalThis as any).top = win;
(globalThis as any).parent = win;
(globalThis as any).location = win.location;
(globalThis as any).navigator = win.navigator;
(globalThis as any).localStorage = win.localStorage;
(globalThis as any).setTimeout = win.setTimeout;
(globalThis as any).clearTimeout = win.clearTimeout;
(globalThis as any).setInterval = win.setInterval;
(globalThis as any).clearInterval = win.clearInterval;
(globalThis as any).URL = win.URL;
(globalThis as any).URLSearchParams = win.URLSearchParams;
(globalThis as any).crypto = win.crypto;
(globalThis as any).MutationObserver = win.MutationObserver;
(globalThis as any).customElements = win.customElements;
(globalThis as any).IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 16);
(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
(globalThis as any).fetch = async () => new Promise(() => {});
(globalThis as any).NodeFilter = {
  SHOW_ALL: -1,
  SHOW_ELEMENT: 1,
  SHOW_TEXT: 4,
  SHOW_COMMENT: 128,
  SHOW_DOCUMENT: 256,
  SHOW_DOCUMENT_TYPE: 512,
  SHOW_DOCUMENT_FRAGMENT: 1024,
  SHOW_PROCESSING_INSTRUCTION: 64,
  SHOW_CDATA_SECTION: 8,
  SHOW_ENTITY_REFERENCE: 16,
  SHOW_ENTITY: 32,
  FILTER_ACCEPT: 1,
  FILTER_REJECT: 2,
  FILTER_SKIP: 3,
};

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});
