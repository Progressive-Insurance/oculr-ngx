import { Inject, Injectable, InjectionToken } from '@angular/core';

import { EVENT_IGNORE } from '../event-constants';
import { trackInteractionEvent } from '../actions/analytics.actions';
import { AnalyticsEventModel } from '../models/analytics-event-model.interface';
import { AnalyticsEventModelMap } from '../models/analytics-event-model-map.interface';
import { InteractionEventPayload } from '../models/interaction-event-payload.interface';
import { AnalyticsEventBusService } from './analytics-event-bus.service';
import { EventDispatchService } from './event-dispatch.service';

export const ANALYTICS_EVENT_MODEL_MAPS = new InjectionToken('ANALYTICS_EVENT_MODEL_MAPS');
export const ANALYTICS_ERROR_MODEL_ID = new InjectionToken('ANALYTICS_ERROR_MODEL_ID');

@Injectable()
export class AnalyticsEventModelsService {

  private models: AnalyticsEventModelMap;
  private errorModelID: string;

  constructor(
    private eventBus: AnalyticsEventBusService,
    private eventDispatch: EventDispatchService,
    @Inject(ANALYTICS_EVENT_MODEL_MAPS) models: any,
    @Inject(ANALYTICS_ERROR_MODEL_ID) errorModelID: string
  ) {
    const composed = {};

    for (const m of models) {
      Object.assign(composed, ...m);
    }

    this.models = composed;
    this.errorModelID = errorModelID;
  }

  // Get all the analytics models, as a map.
  getModels(): AnalyticsEventModelMap {
    return this.models;
  }

  // Get the model associated with an event id.
  // Will dismiss events with an event id = "IGNORE"
  // Will dispatch an error if it cannot find the model.
  getModel(eventId: string): AnalyticsEventModel | undefined {
    const model = this.models[eventId];
    const errorModel = this.models[this.errorModelID];

    if (model) {
      return model;
    }

    if (eventId !== EVENT_IGNORE) {
      if (errorModel) {
        const error: InteractionEventPayload = {
          event: errorModel.details.event,
          id: this.errorModelID,
          model: errorModel,
          customDimensions: { dataValue: eventId }
        };
        this.eventBus.dispatch(trackInteractionEvent(error));
      } else {
        this.eventDispatch.trackAnalyticsError({
          errorMessage: `Could not find event registered for ${eventId}`
        });
      }
    }
  }

}
