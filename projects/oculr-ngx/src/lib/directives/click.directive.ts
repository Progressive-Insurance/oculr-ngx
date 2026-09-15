/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { DirectiveEvent } from '../models/directive-event.interface';
import { InteractionDetail } from '../models/interaction-detail.enum';
import { InteractionType } from '../models/interaction-type.enum';
import { DirectiveService } from '../services/directive.service';
import { DispatchService } from '../services/dispatch.service';

@Directive({
    selector: '[oculrClick]',
    standalone: false
})
export class ClickDirective {
  @Input('oculrClick') directiveEvent: DirectiveEvent | '' = '';
  interactionDetail: InteractionDetail | undefined = undefined;

  @HostListener('click')
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

  @HostListener('keydown')
  onKeydown(): void {
    this.interactionDetail = InteractionDetail.keyboard;
  }

  @HostListener('mousedown')
  onMousedown(): void {
    if (this.interactionDetail !== InteractionDetail.touch) {
      this.interactionDetail = InteractionDetail.mouse;
    }
  }

  @HostListener('touchstart')
  onTouchstart(): void {
    this.interactionDetail = InteractionDetail.touch;
  }

  // The RouterLink directive on the host element (if any) is the authoritative
  // source for the configured route. It is optional because oculrClick can be
  // placed on non-links (e.g. buttons) or on links that use a plain href.
  private readonly routerLinkDirective = inject(RouterLink, { optional: true, self: true });

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
        this.getRouterLink() ||
        this.elementRef.nativeElement.getAttribute('routerLink') ||
        this.elementRef.nativeElement.getAttribute('href') ||
        '';
    }
  }

  // The old code read getAttribute('routerLink'), which only ever resolves for the
  // static attribute form (<a routerLink="/x">) and is null for the idiomatic
  // binding form (<a [routerLink]="['/x']">), leaving linkUrl empty for the most
  // common usage. routerLink is a setter-only input on the RouterLink directive
  // (there is no public getter and the commands are stored in a private signal),
  // so we read the host RouterLink's routerLinkInput signal to recover the
  // configured commands.
  private getRouterLink(): string {
    const routerLink = this.routerLinkDirective;
    if (routerLink) {
      const commands = (routerLink as unknown as { routerLinkInput?: () => unknown[] }).routerLinkInput?.();
      if (Array.isArray(commands)) {
        const path = this.commandsToPath(commands);
        if (path) {
          return path;
        }
      }
    }
    return '';
  }

  private commandsToPath(commands: unknown[]): string {
    return commands
      .filter((command): command is string => typeof command === 'string')
      .join('/');
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
