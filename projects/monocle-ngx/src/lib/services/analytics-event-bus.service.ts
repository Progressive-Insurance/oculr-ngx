import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { StandardAction } from '../models/actions/standard-action.interface';

@Injectable()
export class AnalyticsEventBusService {
  readonly events$: Observable<{ type: string; payload?: any; meta?: any; error?: boolean }>;
  private _events$: Subject<{ type: string; payload?: any; meta?: any; error?: boolean }>;

  constructor() {
    this._events$ = new Subject();
    this.events$ = this._events$.asObservable();
  }

  dispatch(event: StandardAction): void {
    this._events$.next(event);
  }
}
