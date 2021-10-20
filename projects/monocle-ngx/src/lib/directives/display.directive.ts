import { Directive, ElementRef, Input, OnInit } from '@angular/core';

import { AnalyticEvent } from '../models/analytic-event.interface';
import { EventDispatchService } from '../services/event-dispatch.service';

@Directive({
  selector: '[mnclDisplay]',
})
export class DisplayDirective implements OnInit {
  @Input('mnclDisplay') analyticEvent: AnalyticEvent | undefined;

  constructor(private elementRef: ElementRef<HTMLElement>, private eventDispatchService: EventDispatchService) {}

  ngOnInit(): void {
    this.determineId();
    if (this.shouldDispatch()) {
      this.handleEvent();
    }
  }

  private handleEvent() {
    this.eventDispatchService.trackDisplay(this.analyticEvent);
  }

  private determineId(): void {
    const elementId = this.elementRef.nativeElement.getAttribute('id');
    if (elementId) {
      if (this.analyticEvent) {
        this.analyticEvent.id = this.analyticEvent.id || elementId;
      } else {
        this.analyticEvent = { id: elementId } as AnalyticEvent;
      }
    }
  }

  private shouldDispatch(): boolean {
    if (!this.analyticEvent?.id) {
      console.warn(
        `The mnclDisplay directive requires an identifier. This can be done with an id attribute on the
        host element, or by binding an Event object. More information can be found here:
        https://github.com/Progressive/monocle-ngx/blob/main/docs/display-directive.md`
      );
      return false;
    }
    return true;
  }
}
