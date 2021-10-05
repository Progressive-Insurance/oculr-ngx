import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

import { trackInteractionEvent } from '../actions/analytics.actions';
import { AnalyticsEventModel } from '../models/analytics-event-model.interface';
import { EventExtras } from '../models/event-extras.interface';
import { InteractionEventPayload } from '../models/interaction-event-payload.interface';
import { AnalyticsEventModelsService } from '../services/analytics-event-models.service';
import { AnalyticsService } from '../services/analytics.service';
import { EventDispatchService } from '../services/event-dispatch.service';
import { WindowService } from '../utils/window.service';

/**
 * This directive dispatches actions when events occur on the
 * component it is attached to.
 */
@Directive({
  selector: '*:not(pui-input-error)[psEventId]',
})
export class EventIdDirective implements OnInit, OnDestroy {
  /**
   * An event id that will be attached to the action this dispatches.
   */
  @Input() psEventId: string = '';

  /**
   * Used to add extra data to an event..
   */
  @Input() psEventExtras: EventExtras = {};

  handler?: (event: any) => void;
  eventModel: AnalyticsEventModel = {} as AnalyticsEventModel;

  constructor(
    private elementRef: ElementRef,
    private analyticsService: AnalyticsService,
    private analyticsEventModels: AnalyticsEventModelsService,
    private windowService: WindowService,
    private eventDispatch: EventDispatchService
  ) {}

  createCustomEvent() {
    const event = document.createEvent('Event');
    event.initEvent('custom', false, true);
    return event;
  }

  initializeClickEvent() {
    const element = this.elementRef.nativeElement;
    const eventModel = this.analyticsEventModels.getModel(this.psEventId);
    try {
      if (eventModel) {
        const event = this.createCustomEvent();
        this.eventModel = eventModel;
        this.handler = () => {
          let onEvent: (evt: Event) => void;
          let clean: () => void;

          onEvent = (evt: Event) => {
            if (this.shouldDispatchEvent(evt)) {
              this.handleEvent(evt);
              clean();
            }
          };

          clean = () => {
            element.removeEventListener('mouseup', onEvent);
            this.windowService.removeEventListener('mouseup', clean);
          };

          element.addEventListener('mouseup', onEvent);
          this.windowService.addEventListener('mouseup', clean);
        };
        element.addEventListener('mousedown', this.handler);
        element.dispatchEvent(event);
      }
    } catch (error) {
      this.eventDispatch.trackAnalyticsError(error);
    }
  }

  shouldDispatchEvent(e: any) {
    let target = e.target;
    while (target != null && target !== e.currentTarget) {
      if (target.getAttribute('analyticsId')) {
        return;
      }
      target = target.parentNode;
    }
    return target != null && target.getAttribute('analyticsId') === this.psEventId;
  }

  initializeNonClickEvent() {
    const element = this.elementRef.nativeElement;
    const eventModel = this.analyticsEventModels.getModel(this.psEventId);
    if (eventModel) {
      const event = this.createCustomEvent();
      this.eventModel = eventModel;
      this.handler = eventModel.trackOn === 'custom' ? this.customEvent : this.handleEvent;
      element.addEventListener(eventModel.trackOn, this.handler);
      element.dispatchEvent(event);
    }
  }

  ngOnInit() {
    if (this.elementRef && this.elementRef.nativeElement && this.elementRef.nativeElement.nodeName === '#comment') {
      this.eventDispatch.trackAnalyticsError({
        message: 'You cannot attach psEventId to a ng-content/ng-template tag',
      });
    } else {
      const eventModel = this.analyticsEventModels.getModel(this.psEventId);
      if (eventModel) {
        if (eventModel.trackOn === 'click') {
          this.elementRef.nativeElement.setAttribute('analyticsId', this.psEventId);
          this.initializeClickEvent();
        } else {
          this.elementRef.nativeElement.setAttribute('analyticsDisplayId', this.psEventId);
          this.initializeNonClickEvent();
        }
      }
    }
  }

  ngOnDestroy() {
    const element = this.elementRef.nativeElement;
    const trackOn = this.eventModel && this.eventModel.trackOn;
    if (trackOn) {
      const removeListener =
        trackOn === 'click'
          ? () => element.removeEventListener('mousedown', this.handler)
          : () => element.removeEventListener(trackOn, this.handler);
      // This gives time for a queued handleEvent to be called
      // before the listener is removed.
      setTimeout(removeListener, 0);
    }
  }

  customEvent = (event: any) => {
    switch (this.eventModel.details.eventAction) {
      case 'Display': {
        this.handleEvent(event);
      }
    }
  };

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
