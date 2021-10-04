import { AnalyticsEventModel } from './analytics-event-model.interface';
import { SelectedItems } from './selected-items.interface';
import { VariableData } from './variable-data.interface';

export interface TrackInteractionPayload {
  eventId: string;
  model?: AnalyticsEventModel;
  customDimensions?: any;
  variableData?: VariableData;
  selectedItems?: SelectedItems;
}
