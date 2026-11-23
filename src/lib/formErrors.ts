import type { ApiError, FieldErrors } from '@/services/http';

/** Verifica se um valor desconhecido tem o formato de ApiError. */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'isNetworkError' in value &&
    'message' in value
  );
}

/** Extrai os erros por campo de um erro desconhecido (ou objeto vazio). */
export function getFieldErrors(error: unknown): FieldErrors {
  if (isApiError(error) && error.fieldErrors) {
    return error.fieldErrors;
  }
  return {};
}

/** Mensagem legível para toast/alerta a partir de um erro desconhecido. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}

/** Primeira mensagem de um campo específico, ou undefined. */
export function fieldError(
  errors: FieldErrors,
  field: string,
): string | undefined {
  const messages = errors[field];
  return messages && messages.length > 0 ? messages[0] : undefined;
}
