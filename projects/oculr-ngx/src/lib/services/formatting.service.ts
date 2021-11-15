/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FormattingService {
  // TODO: This seems like overkill...maybe can just be integrated into ingestion flow
  formatCifDate(date: Date): string {
    return date.toISOString();
  }

  formatDateWithTimezoneOffset(date: Date): string {
    return `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}-${this.pad(date.getDate())}T${this.pad(
      date.getHours()
    )}:${this.pad(date.getMinutes())}:${this.pad(date.getSeconds())}.${this.pad(date.getMilliseconds(), 3)}${
      date.getTimezoneOffset() < 0 ? '+' : '-'
    }${this.pad(Math.floor(Math.abs(date.getTimezoneOffset()) / 60))}:${this.pad(date.getTimezoneOffset() % 60)}`;
  }

  //TODO: If we support this, it should be refactored to take in a URL and use a safer approach
  getCookieDomain(hostname: string | undefined): string {
    if (hostname === 'localhost' || hostname === undefined) {
      return 'none';
    }
    const tokens = hostname.split('.');
    if (tokens.length < 3) {
      return '.' + hostname;
    }
    return '.' + tokens[tokens.length - 2] + '.' + tokens[tokens.length - 1];
  }

  getSelectedOptions($event: Event): string {
    const options = ($event?.target as HTMLSelectElement)?.options;
    if (!options) {
      return '';
    }
    const selectedOptions = Array.from(options).filter((option: HTMLOptionElement) => option.selected);
    return selectedOptions
      .map((option: HTMLOptionElement) => (option.text || '').replace(/^\s*/, '').replace(/\s*$/, ''))
      .join('&');
  }

  htmlToText(value: string, entitiesToPreserve: string[] = []): string {
    const cleanString = this.removeHtmlEntities(value, entitiesToPreserve);
    const textarea = document.createElement('div');
    textarea.innerHTML = cleanString;
    return textarea.textContent || textarea.innerText || '';
  }

  private removeHtmlEntities(value: string, entitiesToPreserve: string[] = []): string {
    // String replace function is interpreting &nbsp; as whitespace when
    // evaluating regular expression matches, causing &nbsp; not to be replaced.
    const pattern = new RegExp('&[^s]*?;', 'g');

    if (entitiesToPreserve.length) {
      return value.replace(pattern, (match: string) => (entitiesToPreserve.indexOf(match) === -1 ? '' : match));
    }
    return value.replace(pattern, '');
  }

  private pad(num: number, size = 2): string {
    return num.toString().padStart(size, '0');
  }
}
