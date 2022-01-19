/*
 * @license
 * Copyright 2021-2022 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { fakeAsync, tick } from '@angular/core/testing';
import { InitializationService } from './initialization.service';

describe('InitializationService', () => {
  let service: InitializationService;
  const mockConsole = jasmine.createSpyObj('console', ['init']);
  const mockHttp = jasmine.createSpyObj('http', ['init']);

  beforeEach(() => (service = new InitializationService(mockConsole, mockHttp)));

  it('should initialize all destination services', fakeAsync(() => {
    service.init().then(() => {
      expect(mockConsole.init).toHaveBeenCalledTimes(1);
      expect(mockHttp.init).toHaveBeenCalledTimes(1);
    });
    tick();
  }));
});
