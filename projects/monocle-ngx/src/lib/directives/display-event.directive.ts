import { Directive, ElementRef, Input, OnInit } from '@angular/core';

import { EventModel } from '../models/event-model.class';
import { EventDispatchService } from '../services/event-dispatch.service';

@Directive({
  selector: '[pa-display-event]'
})
export class DisplayEventDirective implements OnInit {
  @Input('pa-display-event') eventModel: EventModel | undefined | null;

  constructor(
    private elementRef: ElementRef,
    private eventDispatchService: EventDispatchService
  ) { }

  ngOnInit() {
    if (this.eventModel) {
      this.setAttr();
      this.handleEvent();
    }
  }

  private handleEvent = () => {
    if (this.eventModel && this.eventModel.eventId) {
      this.eventDispatchService.trackDisplay(this.eventModel);
    }
  }

  private setAttr = () => {
    const analyticsId = this.eventModel ? this.eventModel.eventId : '';
    this.elementRef.nativeElement.setAttribute('analytics-display-id', analyticsId);
  }
}
