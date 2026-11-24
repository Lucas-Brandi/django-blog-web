import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Desmonta a árvore e limpa o DOM entre os testes (jsdom não faz sozinho).
afterEach(() => {
  cleanup();
});

// jsdom não implementa URL.createObjectURL/revokeObjectURL, usados na
// pré-visualização da foto em Profile. Stubs simples evitam o erro.
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = () => 'blob:mock';
}
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = () => {};
}

// matchMedia é usado por bibliotecas de UI (ex.: next-themes/sonner) e não
// existe no jsdom.
if (typeof window.matchMedia === 'undefined') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
