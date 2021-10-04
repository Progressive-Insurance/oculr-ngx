import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { SelectedItems } from '../selected-items.interface';
import { VariableData } from '../variable-data.interface';
import { AnalyticsEventModel }  from '../analytics-event-model.interface';

// Since not all APIs are tagged, not all events will have ids and models
export interface ApiFinishedPayload {
  customDimensions?: VariableData;
  id?: string;
  model?: AnalyticsEventModel;
  requestEndTime: number;
  requestStartTime: number;
  response: HttpResponse<any> | HttpErrorResponse;
  selectedItems?: SelectedItems;
  url: string | null; // May be null when HttpErrorResponse is returned
  variableData: {
    duration: number;
    statusCode: string;
    [key: string]: boolean | number | string;
  };
}
