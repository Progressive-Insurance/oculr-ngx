// Flux Standard Action
export interface StandardAction {
  type: string;
  payload?: any;
  error?: boolean;
  meta?: any;
}
