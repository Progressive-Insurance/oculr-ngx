/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
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
