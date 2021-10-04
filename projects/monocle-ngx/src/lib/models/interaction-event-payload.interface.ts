import { HttpResponseBase } from '@angular/common/http';

import { AnalyticsEventModel } from './analytics-event-model.interface';
import { SelectedItems } from './selected-items.interface';
import { VariableData } from './variable-data.interface';

export interface InteractionEventPayload {
  event: any;
  id: string;
  model?: AnalyticsEventModel;
  customDimensions: any;
  variableData?: VariableData;
  selectedItems?: SelectedItems;
  response?: HttpResponseBase;
}
