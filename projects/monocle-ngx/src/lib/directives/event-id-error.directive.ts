import { Directive, HostListener, Input, OnInit } from '@angular/core';

import { trackInteractionEvent } from '../actions/analytics.actions';
import { AnalyticsEventModel } from '../models/analytics-event-model.interface';
import { EventExtras } from '../models/event-extras.interface';
import { InteractionEventPayload } from '../models/interaction-event-payload.interface';
import { AnalyticsEventModelsService } from '../services/analytics-event-models.service';
import { AnalyticsService } from '../services/analytics.service';

/**
 * This directive dispatches actions when error events occur on the
 * component it is attached to.
 */
@Directive({
  selector: 'pui-input-error[psEventId]',
})
export class EventIdErrorDirective implements OnInit {
  /**
   * An event id that will be attached to the action this dispatches.
   */
  @Input() psEventId: string = '';

  /**
   * Used to add extra data to an event..
   */
  @Input() psEventExtras: EventExtras | undefined = {};

  eventModel: AnalyticsEventModel | undefined;

  constructor(private analyticsService: AnalyticsService, private analyticsEventModels: AnalyticsEventModelsService) {}

  @HostListener('errorStateChanged', ['$event'])
  errorStateChanged(event: any) {
    if (event && event.visible) {
      this.handleEvent(event);
    }
  }

  ngOnInit() {
    this.eventModel = this.analyticsEventModels.getModel(this.psEventId);
  }

  handleEvent = (event: any) => {
    const { customDimensions, variableData, selectedItems } = this.psEventExtras
      ? this.psEventExtras
      : {
          customDimensions: undefined,
          variableData: undefined,
          selectedItems: undefined,
        };
    const payload: InteractionEventPayload = {
      event,
      id: this.psEventId,
      model: this.eventModel,
      customDimensions,
      variableData,
      selectedItems,
    };
    this.analyticsService.track(trackInteractionEvent(payload));
  };
}
