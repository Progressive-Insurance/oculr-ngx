export interface Event {
  id?: string;
  customScope?: Record<string, unknown>;
  // TODO: needs a new type, possible generics
  predefinedScopes?: [];
}
