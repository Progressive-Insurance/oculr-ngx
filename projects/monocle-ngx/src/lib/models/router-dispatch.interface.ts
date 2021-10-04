import { SelectedItems } from './selected-items.interface';
import { VariableData } from './variable-data.interface';

export type AdditionalScopes = string[];

export interface RouterEvent {
  location: string;
  currentHostName: string;
  url: string;
  domain: string;
  additionalScopes: AdditionalScopes;
  selectedItems: SelectedItems;
  customDimensions?: VariableData;
  shouldTrack: boolean;
  shouldIncludeAppScope: boolean;
}
export interface VirtualPageStackAction {
  type: 'push' | 'clear' | 'pop';
  url?: string;
  additionalScopes?: AdditionalScopes;
  selectedItems?: SelectedItems;
  customDimensions?: VariableData;
  shouldTrack?: boolean;
  shouldIncludeAppScope?: boolean;
}

export interface VirtualPageStack {
  location: string;
  additionalScopes: AdditionalScopes;
  selectedItems?: SelectedItems;
  customDimensions?: VariableData;
  shouldTrack?: boolean;
  shouldIncludeAppScope?: boolean;
}
