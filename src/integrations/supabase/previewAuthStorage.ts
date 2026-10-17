// Supabase client auth storage helper.
// Returns localStorage in browser environments, and undefined during SSR.
export function brokeredPreviewStorage() {
  if (typeof window === 'undefined') return undefined;
  return localStorage;
}
