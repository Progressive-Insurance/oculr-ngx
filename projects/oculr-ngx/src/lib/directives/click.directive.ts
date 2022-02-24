/*
 * @license
 * Copyright 2021-2022 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/progressive-insurance/oculr-ngx/blob/main/LICENSE.md
 */

import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { DirectiveEvent } from '../models/directive-event.interface';
import { InteractionDetail } from '../models/interaction-detail.enum';
import { InteractionType } from '../models/interaction-type.enum';
import { DirectiveService } from '../services/directive.service';
import { DispatchService } from '../services/dispatch.service';

@Directive({
  selector: '[oculrClick]',
})
export class ClickDirective {
  @Input('oculrClick') directiveEvent: DirectiveEvent | '' = '';
  interactionDetail: InteractionDetail | undefined = undefined;

  @HostListener('click', ['$event'])
  onClick(): void {
    const analyticEvent = this.directiveService.getAnalyticEvent(this.directiveEvent);
    this.directiveService.setId(analyticEvent, this.elementRef);
    if (this.shouldDispatch(analyticEvent)) {
      this.setInteractionType(analyticEvent);
      this.setInteractionDetail(analyticEvent);
      this.directiveService.setElement(analyticEvent, this.elementRef);
      this.directiveService.setLabel(analyticEvent, this.elementRef);
      this.setActivatedRoute(analyticEvent);
      this.setHostUrl(analyticEvent);
      this.handleEvent(analyticEvent);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(): void {
    this.interactionDetail = InteractionDetail.keyboard;
  }

  @HostListener('mousedown', ['$event'])
  onMousedown(): void {
    if (this.interactionDetail !== InteractionDetail.touch) {
      this.interactionDetail = InteractionDetail.mouse;
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchstart(): void {
    this.interactionDetail = InteractionDetail.touch;
  }

  constructor(
    private elementRef: ElementRef<HTMLButtonElement | HTMLLinkElement>,
    private dispatchService: DispatchService,
    private directiveService: DirectiveService,
    private activatedRoute: ActivatedRoute
  ) {}

  private setInteractionType(analyticEvent: AnalyticEvent): void {
    analyticEvent.interactionType = InteractionType.click;
  }

  private setInteractionDetail(analyticEvent: AnalyticEvent): void {
    analyticEvent.interactionDetail = this.interactionDetail;
  }

  private setActivatedRoute(analyticEvent: AnalyticEvent): void {
    analyticEvent.activatedRoute = this.activatedRoute.snapshot;
  }

  private setHostUrl(analyticEvent: AnalyticEvent): void {
    if (this.directiveService.getElementName(this.elementRef) === 'a') {
      analyticEvent.linkUrl =
        this.elementRef.nativeElement.getAttribute('routerLink') ||
        this.elementRef.nativeElement.getAttribute('href') ||
        '';
    }
  }

  private handleEvent(analyticEvent: AnalyticEvent) {
    this.dispatchService.trackClick(analyticEvent);
  }

  private shouldDispatch(analyticEvent: AnalyticEvent): boolean {
    return this.directiveService.shouldDispatch(
      analyticEvent,
      'oculrClick',
      'https://github.com/progressive-insurance/oculr-ngx/blob/main/docs/click-directive.md'
    );
  }
}
