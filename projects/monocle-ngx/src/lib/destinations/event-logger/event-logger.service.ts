import { Injectable } from '@angular/core';
import { catchError, tap, ignoreElements, switchMap } from 'rxjs/operators';
import { of, EMPTY } from 'rxjs';

import { AnalyticsEventBusService } from '../../services/analytics-event-bus.service';
import { EventDispatchService } from '../../services/event-dispatch.service';
import { Logger } from '../../models/logger.type';

@Injectable()
export class EventLoggerService {

  constructor(
    private eventBus: AnalyticsEventBusService,
    private eventDispatchService: EventDispatchService
  ) { }

  init(logger: Logger) {
    this.eventBus.events$.pipe(
      switchMap((inputAction) => {
        return of(inputAction).pipe(
          tap(action => {
            logger(action);
          }),
          catchError(error => {
            this.eventDispatchService.trackAnalyticsError(error);
            return EMPTY;
          })
        );
      }),
      ignoreElements()
    ).subscribe();
  }
}