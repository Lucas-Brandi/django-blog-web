/** Idioma usado na formatação de datas e números da interface (D6). */
export const UI_LOCALE = 'pt-BR';

const dateFormatter = new Intl.DateTimeFormat(UI_LOCALE, {
  dateStyle: 'long',
});

/**
 * Formata uma data ISO da API no idioma da interface.
 * Ex.: "2026-11-23T18:52:56Z" -> "23 de novembro de 2026".
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}
