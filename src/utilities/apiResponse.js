// DatabaseService (see src/services/DatabaseService.jsx) resolves — rather than rejects —
// on request failure, returning either the backend's error payload or a plain error string.
// Callers must check the resolved value themselves instead of relying on try/catch alone.
export const isFailureResponse = (response) => {
  if (!response) return true;
  if (typeof response === 'string') return true;
  return response.success === false;
};

export const getResponseErrorMessage = (response, fallback) => {
  if (typeof response === 'string') return response;
  return response?.message || fallback;
};
