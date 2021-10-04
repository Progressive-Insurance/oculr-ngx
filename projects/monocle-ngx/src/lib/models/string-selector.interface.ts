/**
 * Should select an endpoint or api key for the destination.
 * Can either return a constant or select from state.
 */
export type StringSelector = (state?: any) => string;
