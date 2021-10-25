import { Directive, ElementRef, HostListener, Input } from '@angular/core';

import { AnalyticEvent } from '../models/analytic-event.interface';
import { InteractionDetail } from '../models/interaction-detail.enum';
import { InteractionType } from '../models/interaction-type.enum';
import { EventDispatchService } from '../services/event-dispatch.service';

@Directive({
  selector: '[mnclButton]',
})
export class ButtonDirective {
  @Input('mnclButton') analyticEventInput: AnalyticEvent | undefined;

  @HostListener('click', ['$event'])
  onClick(mouseEvent: MouseEvent): void {
    const analyticEvent = this.getAnalyticEvent();
    this.determineId(analyticEvent);
    if (this.shouldDispatch(analyticEvent)) {
      analyticEvent.interactionType = InteractionType.click;
      this.determineInteractionDetail(analyticEvent, mouseEvent);
      this.determineLabel(analyticEvent);
      this.handleEvent(analyticEvent);
    }
  }

  constructor(private elementRef: ElementRef<HTMLButtonElement>, private eventDispatchService: EventDispatchService) {}

  private getAnalyticEvent(): AnalyticEvent {
    return this.analyticEventInput ? { ...this.analyticEventInput } : { id: '' };
  }

  private determineId(analyticEvent: AnalyticEvent): void {
    const elementId = this.elementRef.nativeElement.getAttribute('id');
    if (elementId) {
      analyticEvent.id ||= elementId;
    }
  }

  private determineInteractionDetail(analyticEvent: AnalyticEvent, mouseEvent: MouseEvent): void {
    analyticEvent.interactionDetail = mouseEvent.detail === 0 ? InteractionDetail.keyboard : InteractionDetail.mouse;
  }

  private determineLabel(analyticEvent: AnalyticEvent): void {
    const buttonText = this.elementRef.nativeElement.innerText;
    if (buttonText) {
      analyticEvent.label ||= buttonText;
    }
  }

  private handleEvent(analyticEvent: AnalyticEvent) {
    this.eventDispatchService.trackButtonInteraction(analyticEvent);
  }

  private shouldDispatch(analyticEvent: AnalyticEvent): boolean {
    if (!analyticEvent.id) {
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
