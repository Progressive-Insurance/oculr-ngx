import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AnalyticEvent } from '../models/analytic-event.interface';

@Injectable()
export class AnalyticsEventBusService {
  readonly events$: Observable<AnalyticEvent>;
  private _events$: Subject<AnalyticEvent>;

  constructor() {
    this._events$ = new Subject();
    this.events$ = this._events$.asObservable();
  }

  dispatch(event: AnalyticEvent): void {
    this._events$.next(event);
  }
}
