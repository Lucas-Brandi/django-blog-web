/** Link de navegação principal exibido na navbar. */
export interface NavLink {
  /** Caminho da rota (usado pelo react-router). */
  to: string;
  /** Rótulo em português exibido ao usuário (D6). */
  label: string;
  /** Casa exatamente com o caminho (evita marcar "Home" em subrotas). */
  end?: boolean;
}

/** Links públicos principais da navbar. */
export const NAV_LINKS: NavLink[] = [
  { to: '/', label: 'Início', end: true },
  { to: '/sobre', label: 'Sobre' },
];

/** Nome da marca exibido na navbar e no rodapé. */
export const BRAND_NAME = 'Django Blog';

/** Sufixo usado no título da aba do navegador. */
export const SITE_TITLE = 'Django Blog';
