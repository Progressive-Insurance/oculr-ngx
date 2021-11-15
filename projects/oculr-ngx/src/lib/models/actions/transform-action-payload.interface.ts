import { EVENT_TYPES } from '../../event-types';
import { SelectedItems } from '../selected-items.interface';
import { VariableData } from '../variable-data.interface';

export interface TransformActionPayload {
  eventId?: string;
  eventType?: EVENT_TYPES;
  eventModel?: any;
  customDimensions?: any;
  variableData?: VariableData;
  selectedItems?: SelectedItems;
  properties: {
    [key: string]: any;
  };
}
