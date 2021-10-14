import { Directive, ElementRef, Input, OnInit } from '@angular/core';

import { Event } from '../models/event.interface';
import { EventDispatchService } from '../services/event-dispatch.service';

@Directive({
  selector: '[mnclDisplay]',
})
export class DisplayDirective implements OnInit {
  @Input('mnclDisplay') event: Event | undefined;
  elementId: string | undefined;

  constructor(private elementRef: ElementRef<HTMLElement>, private eventDispatchService: EventDispatchService) {}

  ngOnInit(): void {
    this.elementId = this.getElementId();
    this.handleEvent();
  }

  private handleEvent() {
    this.eventDispatchService.trackDisplay(this.event, this.elementId);
  }

  private getElementId(): string | undefined {
    return this.elementRef.nativeElement.getAttribute('id') || undefined;
  }
}
