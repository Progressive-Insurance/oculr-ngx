import { Directive, ElementRef, HostListener, Input } from '@angular/core';

import { AnalyticEvent } from '../models/analytic-event.interface';
import { EventDispatchService } from '../services/event-dispatch.service';

@Directive({
  selector: '[mnclButton]',
})
export class ButtonDirective {
  @Input('mnclButton') analyticEvent: AnalyticEvent | undefined;

  @HostListener('click', ['$event'])
  onClick(): void {
    this.determineId();
    if (this.shouldDispatch()) {
      this.handleEvent();
    }
  }

  constructor(private elementRef: ElementRef<HTMLButtonElement>, private eventDispatchService: EventDispatchService) {}

  private handleEvent() {
    this.eventDispatchService.trackButtonInteraction(this.analyticEvent);
  }

  // export to a service
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

  // export to a service
  private shouldDispatch(): boolean {
    if (!this.analyticEvent?.id) {
      console.warn(
        `The mnclButton directive requires an identifier. This can be done with an id attribute on the
        host element, or by binding an Event object. More information can be found here:
        https://github.com/Progressive/monocle-ngx/blob/main/docs/button-directive.md`
      );
      return false;
    }
    return true;
  }
}
