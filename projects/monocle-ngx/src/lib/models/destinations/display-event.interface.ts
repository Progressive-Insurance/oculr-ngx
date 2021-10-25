export interface DisplayEvent {
  id: string;
  label?: string;
  customScope?: Record<string, unknown>;
  // TODO: needs a new type, possible generics
  configuredScopes?: string[];
}
