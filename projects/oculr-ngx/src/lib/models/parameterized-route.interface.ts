/* 
Copyright (c) 2021 Progressive Casualty Insurance Company. All rights reserved.

Progressive-owned, no external contributions.
*/

import { ParamMap } from '@angular/router';

export interface ParameterizedRoute {
  route: string;
  queryParamMap: ParamMap;
  paramMap: ParamMap;
}
