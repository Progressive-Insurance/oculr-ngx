export interface Event {
  id?: string;
  label?: string;
  customScope?: Record<string, unknown>;
  // TODO: needs a new type, possible generics
  predefinedScopes?: [];
}
