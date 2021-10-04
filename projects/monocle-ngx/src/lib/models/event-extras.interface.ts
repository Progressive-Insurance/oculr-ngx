import { SelectedItems } from './selected-items.interface';
import { VariableData } from './variable-data.interface';

export interface EventExtras {
  customDimensions?: any;
  selectedItems?: SelectedItems;
  variableData?: VariableData;
}
