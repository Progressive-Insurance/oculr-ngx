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
    this.handleEmptyEvent();
    this.handleEvent();
  }

  private handleEvent() {
    this.eventDispatchService.trackDisplay(this.event || undefined);
  }

  private determineId(): void {
    const elementId = this.elementRef.nativeElement.getAttribute('id') || undefined;
    if (elementId) {
      if (this.event) {
        this.event.id = this.event.id || elementId;
      } else {
        this.event = { id: elementId } as Event;
      }
    }
  }

  private handleEmptyEvent(): void {
    if (!this.event) {
      console.warn('mnclDisplay requires an id attribute on the host element, or a bound Event object.');
    }
  }
}
