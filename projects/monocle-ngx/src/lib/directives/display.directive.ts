import { Directive, ElementRef, Input, OnInit } from '@angular/core';

import { Event } from '../models/event.interface';
import { EventDispatchService } from '../services/event-dispatch.service';

@Directive({
  selector: '[mnclDisplay]',
})
export class DisplayDirective implements OnInit {
  @Input('mnclDisplay') event: Event | undefined;

  constructor(private elementRef: ElementRef<HTMLElement>, private eventDispatchService: EventDispatchService) {}

  ngOnInit(): void {
    this.determineId();
    if (this.shouldDispatch()) {
      this.handleEvent();
    }
  }

  private handleEvent() {
    this.eventDispatchService.trackDisplay(this.event);
  }

  private determineId(): void {
    const elementId = this.elementRef.nativeElement.getAttribute('id');
    if (elementId) {
      if (this.event) {
        this.event.id = this.event.id || elementId;
      } else {
        this.event = { id: elementId } as Event;
      }
    }
  }

  private shouldDispatch(): boolean {
    if (!this.event?.id) {
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
