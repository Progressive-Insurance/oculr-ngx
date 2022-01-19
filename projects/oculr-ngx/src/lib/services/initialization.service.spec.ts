/* 
Copyright (c) 2021 Progressive Casualty Insurance Company. All rights reserved.

Progressive-owned, no external contributions.
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
