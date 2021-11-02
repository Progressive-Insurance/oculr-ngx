import { Directive, ElementRef, HostListener, Input } from '@angular/core';

import { AnalyticEvent } from '../models/analytic-event.interface';
import { InteractionDetail } from '../models/interaction-detail.enum';
import { InteractionType } from '../models/interaction-type.enum';
import { EventDispatchService } from '../services/event-dispatch.service';

@Directive({
  selector: '[mnclClick]',
})
export class ClickDirective {
  @Input('mnclClick') analyticEventInput: AnalyticEvent | undefined;

  @HostListener('click', ['$event'])
  onClick(mouseEvent: MouseEvent): void {
    const analyticEvent = this.getAnalyticEvent();
    this.determineId(analyticEvent);
    if (this.shouldDispatch(analyticEvent)) {
      analyticEvent.interactionType = InteractionType.click;
      this.determineInteractionDetail(analyticEvent, mouseEvent);
      this.determineLabel(analyticEvent);
      this.determineHostUrl(analyticEvent);
      this.handleEvent(analyticEvent);
    }
  }

  constructor(
    private elementRef: ElementRef<HTMLButtonElement | HTMLLinkElement>,
    private eventDispatchService: EventDispatchService
  ) {}

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
    const hostText = this.elementRef.nativeElement.innerText;
    if (hostText) {
      analyticEvent.label ||= hostText;
    }
  }

  private determineHostUrl(analyticEvent: AnalyticEvent): void {
    if (this.elementRef.nativeElement.tagName.toLowerCase() === 'a') {
      analyticEvent.linkUrl =
        this.elementRef.nativeElement.getAttribute('routeLink') ||
        this.elementRef.nativeElement.getAttribute('href') ||
        '';
    }
  }

  private handleEvent(analyticEvent: AnalyticEvent) {
    this.eventDispatchService.trackClick(analyticEvent);
  }

  private shouldDispatch(analyticEvent: AnalyticEvent): boolean {
    if (!analyticEvent.id) {
      console.warn(
        `The mnclClick directive requires an identifier. This can be done with an id attribute on the
        host element, or by binding an Event object. More information can be found here:
        https://github.com/Progressive/monocle-ngx/blob/main/docs/click-directive.md`
      );
      return false;
    }
    return true;
  }
}
