import { EventEmitter, Injectable } from '@angular/core';

import { trackInteractionEvent } from '../actions/analytics.actions';
import { AnalyticsAction } from '../models/actions/analytics-action.enum';
import { AnalyticsEventModel } from '../models/analytics-event-model.interface';
import { InteractionEventPayload } from '../models/interaction-event-payload.interface';
import { TrackInteractionPayload } from '../models/track-interaction-payload.interface';
import { AnalyticsEventModelsService } from '../services/analytics-event-models.service';
import { replaceVars } from '../utils/replace-vars';
import { AnalyticsEventBusService } from './analytics-event-bus.service';

export const updateEventDetails = (propName: string) => (value: any, evt: { payload: { model: { details: any } } }) => {
  return {
    ...evt,
    payload: {
      ...evt.payload,
      model: {
        ...evt.payload.model,
        details: {
          ...evt.payload.model.details,
          [propName]: value,
        },
      },
    },
  };
};

export const updateEventLabel = updateEventDetails('eventLabel');
export const updateEventValue = updateEventDetails('eventValue');

@Injectable()
export class AnalyticsService {
  private dispatcher: EventEmitter<any> = new EventEmitter();

  constructor(private eventBus: AnalyticsEventBusService, private analyticsEventModels: AnalyticsEventModelsService) {
    this.setupDispatcher();
  }

  track = (event: any) => {
    this.dispatcher.next(event);
  };

  trackInteraction = (trackInteractionPayload: TrackInteractionPayload) => {
    const event: InteractionEventPayload = {
      event: AnalyticsAction.INTERACTION_EVENT,
      id: trackInteractionPayload.eventId,
      model: trackInteractionPayload.model,
      customDimensions: trackInteractionPayload.customDimensions,
      selectedItems: trackInteractionPayload.selectedItems,
      variableData: trackInteractionPayload.variableData,
    };

    this.dispatcher.next(trackInteractionEvent(event));
  };

  private getModel = (id: string): AnalyticsEventModel | undefined => {
    let model: AnalyticsEventModel | undefined;

    try {
      model = !!id ? this.analyticsEventModels.getModel(id) : undefined;
    } catch (e) {
      console.warn(`pgr-ps/analytics: Error trying to retrieve model for eventId: ${id}`);
      console.warn(`Error:`, e);
      console.warn(`Did you register the tracking model with the MonocleAngularModule? `);
      console.warn(`Example:`);
      // using a string literal ` keeps white-space that I don't want in the error message. Want more control over the display
      // of it.
      console.warn('@NgModule({\n' + '    imports[ MonocleAngularModule.forChild([TEST_API_EVENTS]) ]\n' + '})');
      console.warn();
    }

    return model;
  };
  private setupDispatcher = () => {
    this.dispatcher.subscribe((evt: any) => {
      const eventId = evt && evt.payload && evt.payload.id;

      if (typeof eventId !== 'undefined' && typeof evt.payload.model === 'undefined') {
        evt = {
          ...evt,
          payload: {
            ...evt.payload,
            model: this.getModel(eventId),
          },
        };
      }

      if (evt.payload.model && evt.payload.variableData) {
        const { eventLabel, eventValue } = evt.payload.model.details;
        evt = updateEventLabel(replaceVars(eventLabel, evt.payload.variableData), evt);
        evt = updateEventValue(parseInt(replaceVars('' + eventValue, evt.payload.variableData, '0'), 10), evt);
      }

      this.eventBus.dispatch(evt);
    });
  };
}
