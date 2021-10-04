/**
 * Should transform an action and the state into an event
 * that will be sent to the analytics destination.
 */
export type Transform = (action: any, state: any) => any | undefined;
