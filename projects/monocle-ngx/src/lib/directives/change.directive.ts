import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

import { AnalyticEvent } from '../models/analytic-event.interface';
import { InteractionDetail } from '../models/interaction-detail.enum';
import { InteractionType } from '../models/interaction-type.enum';
import { EventDispatchService } from '../services/event-dispatch.service';

@Directive({
  selector: '[mnclChange]',
})
export class ChangeDirective implements OnInit {
  @Input('mnclChange') analyticEventInput: AnalyticEvent | '' = '';
  @Input() sensitiveData = false;
  interactionDetail: InteractionDetail | undefined = undefined;

  @HostListener('change', ['$event'])
  onChange(event: Event): void {
    const analyticEvent = this.getAnalyticEvent();
    this.determineId(analyticEvent);
    if (this.shouldDispatch(analyticEvent)) {
      analyticEvent.interactionType = InteractionType.change;
      this.determineInteractionDetail(analyticEvent);
      this.determineLabel(analyticEvent);
      if (!this.sensitiveData) {
        this.determineValue(analyticEvent, event);
      }
      this.handleEvent(analyticEvent);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(): void {
    this.interactionDetail = InteractionDetail.keyboard;
  }

  @HostListener('mousedown', ['$event'])
  onMousedown(): void {
    this.interactionDetail = InteractionDetail.mouse;
  }

  constructor(private elementRef: ElementRef<HTMLSelectElement>, private eventDispatchService: EventDispatchService) {}

  ngOnInit(): void {
    this.checkHost();
  }

  private getAnalyticEvent(): AnalyticEvent {
    return this.analyticEventInput ? { ...this.analyticEventInput } : { id: '' };
  }

  private getLabel(): string {
    const labels = this.elementRef.nativeElement.labels;
    let labelText = '';
    if (labels) {
      labels.forEach((label) => (labelText += label.textContent));
    }
    return labelText;
  }

  private determineId(analyticEvent: AnalyticEvent): void {
    const elementId = this.elementRef.nativeElement.getAttribute('id');
    if (elementId) {
      analyticEvent.id ||= elementId;
    }
  }

  private determineInteractionDetail(analyticEvent: AnalyticEvent): void {
    analyticEvent.interactionDetail = this.interactionDetail;
  }

  private determineLabel(analyticEvent: AnalyticEvent): void {
    analyticEvent.label ||= this.getLabel();
  }

  private determineValue(analyticEvent: AnalyticEvent, event: Event): void {
    const target = event.target as HTMLInputElement;
    const inputType =
      this.elementRef.nativeElement.tagName.toLowerCase() === 'select'
        ? 'select'
        : this.elementRef.nativeElement.getAttribute('type');
    switch (inputType) {
      case 'radio':
        analyticEvent.value = target.value;
        analyticEvent.displayValue = this.getLabel();
        break;
      case 'select':
        analyticEvent.value = target.value;
        analyticEvent.displayValue =
          this.elementRef.nativeElement.options[this.elementRef.nativeElement.selectedIndex].text;
        break;
      case 'checkbox':
        analyticEvent.value = target.checked ? 'checked' : 'unchecked';
        analyticEvent.displayValue = this.getLabel();
        break;
      default:
        break;
    }
  }

  private handleEvent(analyticEvent: AnalyticEvent) {
    this.eventDispatchService.trackChange(analyticEvent);
  }

  private checkHost(): void {
    if (
      this.elementRef.nativeElement.tagName.toLowerCase() !== 'select' &&
      !['radio', 'checkbox'].includes(this.elementRef.nativeElement.getAttribute('type') || '')
    ) {
      console.warn(
        `The mnclChange directive only works when the host element is a select, radio input, or checkbox input.
         More information can be found here: https://github.com/Progressive/monocle-ngx/blob/main/docs/change-directive.md`
      );
    }
  }

  private shouldDispatch(analyticEvent: AnalyticEvent): boolean {
    if (!analyticEvent.id) {
      console.warn(
        `The mnclChange directive requires an identifier. This can be done with an id attribute on the
        host element, or by binding an Event object. More information can be found here:
        https://github.com/Progressive/monocle-ngx/blob/main/docs/change-directive.md`
      );
      return false;
    }
    return true;
  }
}
