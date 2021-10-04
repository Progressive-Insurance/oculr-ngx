import { SelectedItems } from '../selected-items.interface';
import { VariableData } from '../variable-data.interface';
import { AnalyticsEventModel }  from '../analytics-event-model.interface';

// since not all apis are tagged, not all events will have ids and models
export interface ApiStartedPayload {
  customDimensions?: VariableData;
  id?: string;
  model?: AnalyticsEventModel;
  requestStartTime: number;
  selectedItems?: SelectedItems;
  variableData?: VariableData;
}
