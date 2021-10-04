import { StandardAction } from './actions/standard-action.interface';

/**
 * Should log the action provided
 */
export type Logger = (event: StandardAction) => void;
