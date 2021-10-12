import {
  Directive, ElementRef, Input, OnChanges, OnDestroy,
  SimpleChanges
} from '@angular/core';

import { EventModel } from '../models/event-model.class';
import { EventDispatchService } from '../services/event-dispatch.service';
import { WindowService } from '../utils/window.service';

@Directive({
  selector: '[pa-interaction-event]',
})
export class InteractionEventDirective implements OnChanges, OnDestroy {
  @Input('pa-interaction-event') eventModel: EventModel | undefined | null;

  private handler?: (event: any) => void;
  private attachedEvent = '';

  constructor(
    private elementRef: ElementRef,
    private eventDispatchService: EventDispatchService,
    private windowService: WindowService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['eventModel'] &&
      changes['eventModel'].currentValue &&
      (!changes['eventModel'].previousValue ||
        changes['eventModel'].currentValue.eventId !== changes['eventModel'].previousValue.eventId)
    ) {
      this.setAttr();
      this.removeListener();
      this.addListener();
    }
  }

  ngOnDestroy() {
    setTimeout(this.removeListener, 0);
  }

  initializeClickEvent() {
    const element = this.elementRef.nativeElement;
    try {
      this.handler = () => {
        let onEvent: (evt: Event) => void;
        let clean: () => void;

        onEvent = (evt: Event) => {
          this.handleEvent(evt);
          clean();
        };

        clean = () => {
          element.removeEventListener('mouseup', onEvent);
          this.windowService.removeEventListener('mouseup', clean);
        };

        element.addEventListener('mouseup', onEvent);
        this.windowService.addEventListener('mouseup', clean);
      };
      element.addEventListener('mousedown', this.handler);
    } catch (error) {
      this.eventDispatchService.trackAnalyticsError(error);
    }
  }

  private handleEvent = (event: any) => {
    if (this.eventModel) {
      // bubble up to first element that has an id
      let target = event.target;
      while (target != null && target !== event.currentTarget) {
        if (target.getAttribute('analytics-id')) {
          break;
        }
        target = target.parentNode;
      }
      if (target != null && target.getAttribute('analytics-id') === this.eventModel.eventId) {
        this.eventDispatchService.trackInteraction(this.eventModel, event);
      }
    }
  };

  private addListener = () => {
    if (this.eventModel) {
      this.attachedEvent = this.eventModel.trackOn;
      const element = this.elementRef.nativeElement;
      if (this.attachedEvent === 'click') {
        this.initializeClickEvent();
      } else {
        element.addEventListener(this.attachedEvent, this.handleEvent);
      }
    }
  };

  private removeListener = () => {
    if (this.attachedEvent !== undefined) {
      const element = this.elementRef.nativeElement;
      const removeListener =
        this.attachedEvent === 'click'
          ? () => element.removeEventListener('mousedown', this.handler)
          : () => element.removeEventListener(this.attachedEvent, this.handler);
      setTimeout(removeListener, 0);
    }
  };

  private setAttr = () => {
    const analyticsId = this.eventModel ? this.eventModel.eventId : '';
    this.elementRef.nativeElement.setAttribute('analytics-id', analyticsId);
  };
}
