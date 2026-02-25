/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
 */

import { InitializationService } from './initialization.service';

describe('InitializationService', () => {
  let service: InitializationService;
  const mockConsole = {
    init: vi.fn().mockName('console.init'),
  };

  const mockHttp = {
    init: vi.fn().mockName('http.init'),
  };

  beforeEach(() => (service = new InitializationService(mockConsole as any, mockHttp as any)));

  it('should initialize all destination services', async () => {
    vi.useFakeTimers();
    service.init().then(() => {
      expect(mockConsole.init).toHaveBeenCalledTimes(1);
      expect(mockHttp.init).toHaveBeenCalledTimes(1);
    });
    await vi.runAllTimersAsync();
    vi.useRealTimers();
  });
});
