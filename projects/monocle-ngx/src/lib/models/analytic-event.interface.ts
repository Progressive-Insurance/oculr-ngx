import { InteractionDetail } from './interaction-detail.enum';
import { InteractionType } from './interaction-type.enum';

export interface AnalyticEvent {
  id: string;
  label?: string;
  interactionType?: InteractionType;
  interactionDetail?: InteractionDetail;
  customScope?: Record<string, unknown>;
  // TODO: needs a new type, possible generics
  predefinedScopes?: [];
}
