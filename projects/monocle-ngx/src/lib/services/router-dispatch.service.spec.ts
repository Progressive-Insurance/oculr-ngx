import { convertToParamMap, Params, Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';

import { EVENT_TYPES } from '../event-types';
import { RouterDispatchService } from './router-dispatch.service';

const makeExpectedAction = (
  path: string,
  scopes: string[] = [],
  selectedItems: any = {},
  customDimensions?: any,
  shouldTrack = true
) => {
  return {
    type: '@pgr/analytics/UPDATE_LOCATION',
    payload: {
      angularRoute: path,
      routeWithQueryString: path,
      hostName: 'www.test',
      fullPath: `www.test${path}`,
      model: { details: { scopes: ['AppLevelScope', ...scopes] } },
      domain: 'test.domain',
      selectedItems: selectedItems,
      customDimensions,
    },
    meta: {
      track: shouldTrack,
      trackAs: EVENT_TYPES.page,
    },
  };
};

describe('Router Dispatch Service', () => {
  let service: RouterDispatchService;
  let mockRouter: any;
  let mockLocation: any;
  let mockWindowService: any;
  let mockEventBusService: any;
  let mockEventCacheService: any;
  let mockRouterUtilityService: any;
  let url: string;

  beforeEach(() => {
    url = 'www.test/my/path';
    mockWindowService = {
      get url() {
        return url;
      },
      get hostName() {
        return 'test.domain';
      },
    };
    mockEventBusService = {
      dispatch: jasmine.createSpy('dispatch'),
    };
    mockEventCacheService = {
      cacheEvent: jasmine.createSpy('cacheEvent'),
    };

    mockRouter = {
      events: new Subject<Event>(),
      routerState: {
        root: {
          snapshot: {
            firstChild: {
              data: {},
              paramMap: convertToParamMap({}),
            },
          },
        },
      },
    };
    mockLocation = {
      path: () => '/my/path',
    };
    mockRouterUtilityService = {
      getSnapshotHierarchyAsArray: () => {
        return [{ routeConfig: { path: 'account-home' }, paramMap: convertToParamMap({}) }];
      },
      replaceTokensWithValuesFromParamMap: () => {
        return '';
      },
    };

    service = new RouterDispatchService(
      mockRouter as Router,
      mockLocation as Location,
      mockWindowService,
      mockEventBusService,
      mockEventCacheService,
      mockRouterUtilityService
    );
  });

  it('should dispatch UPDATE_LOCATION action', () => {
    service.initialize();
    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();

    mockRouter.events.next(new NavigationEnd(1, '123', '123'));

    expect(mockEventBusService.dispatch).toHaveBeenCalledWith({
      type: '@pgr/analytics/UPDATE_LOCATION',
      payload: {
        angularRoute: '/my/path',
        routeWithQueryString: '/my/path',
        hostName: 'www.test',
        fullPath: 'www.test/my/path',
        model: { details: { scopes: ['AppLevelScope'] } },
        domain: 'test.domain',
        selectedItems: {},
        customDimensions: undefined,
      },
      meta: {
        track: true,
        trackAs: EVENT_TYPES.page,
      },
    });
  });

  it('should cache UPDATE_LOCATION action', () => {
    service.initialize();
    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();

    mockRouter.events.next(new NavigationEnd(1, '123', '123'));

    expect(mockEventCacheService.cacheEvent).toHaveBeenCalledWith({
      type: '@pgr/analytics/UPDATE_LOCATION',
      payload: {
        angularRoute: '/my/path',
        routeWithQueryString: '/my/path',
        hostName: 'www.test',
        fullPath: 'www.test/my/path',
        model: { details: { scopes: ['AppLevelScope'] } },
        domain: 'test.domain',
        selectedItems: {},
        customDimensions: undefined,
      },
      meta: {
        track: true,
        trackAs: EVENT_TYPES.page,
      },
    });
  });

  it('should dispatch UPDATE_LOCATION action with Query String Param', () => {
    mockWindowService = {
      get url() {
        return 'www.test/my/path?name=batman&realName=xxx';
      },
      get hostName() {
        return 'test.domain';
      },
    };
    spyOn(mockLocation, 'path').and.returnValue('/my/path?name=batman&realName=xxx');

    service = new RouterDispatchService(
      mockRouter as Router,
      mockLocation as Location,
      mockWindowService,
      mockEventBusService,
      mockEventCacheService,
      mockRouterUtilityService
    );

    service.initialize();

    mockRouter.events.next(new NavigationEnd(1, '123', '123'));

    expect(mockEventBusService.dispatch).toHaveBeenCalledWith({
      type: '@pgr/analytics/UPDATE_LOCATION',
      payload: {
        angularRoute: '/my/path',
        routeWithQueryString: '/my/path?name=batman&realName=xxx',
        hostName: 'www.test',
        fullPath: 'www.test/my/path?name=batman&realName=xxx',
        model: { details: { scopes: ['AppLevelScope'] } },
        domain: 'test.domain',
        selectedItems: {},
        customDimensions: undefined,
      },
      meta: {
        track: true,
        trackAs: EVENT_TYPES.page,
      },
    });
  });

  it('should not fire events other than NavigationEnd', () => {
    service.initialize();

    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();

    mockRouter.events.next(new NavigationStart(1, '123'));
    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();
  });

  it('should only run if the actual URL changed', () => {
    spyOn(mockLocation, 'path').and.returnValues('/my/path', '/my/path', '/new/path');

    service.initialize();
    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();
    mockRouter.events.next(new NavigationEnd(1, '123', '123'));
    mockRouter.events.next(new NavigationEnd(2, '1234', '1234'));
    mockRouter.events.next(new NavigationEnd(3, '1233', '1233'));

    expect(mockEventBusService.dispatch).toHaveBeenCalledTimes(2);
  });

  it('should use event from virtual page stack if populated', () => {
    service.initialize();

    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();

    mockRouter.events.next(new NavigationEnd(1, '123', '123'));

    service.virtualRoute.next({ type: 'push', url: '/test/url' });

    expect(mockEventBusService.dispatch).toHaveBeenCalledWith(makeExpectedAction('/my/path', [], {}));
    expect(mockEventBusService.dispatch).toHaveBeenCalledWith(makeExpectedAction('/test/url', [], {}, undefined, true));
  });

  it('should dispatch UPDATE_LOCATION with shouldTrack value from virtual page stack when present', () => {
    service.initialize();

    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();

    mockRouter.events.next(new NavigationEnd(1, '123', '123'));

    service.virtualRoute.next({ type: 'push', url: '/some/modal', shouldTrack: false });

    expect(mockEventBusService.dispatch).toHaveBeenCalledWith(makeExpectedAction('/my/path', [], {}));
    expect(mockEventBusService.dispatch).toHaveBeenCalledWith(
      makeExpectedAction('/some/modal', [], {}, undefined, false)
    );
  });

  it('should dispatch UPDATE_LOCATION with shouldTrack value true when not preset on virtual page stack item', () => {
    service.initialize();

    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();

    mockRouter.events.next(new NavigationEnd(1, '123', '123'));

    service.virtualRoute.next({ type: 'push', url: '/some/modal' });

    expect(mockEventBusService.dispatch).toHaveBeenCalledWith(makeExpectedAction('/my/path', [], {}));
    expect(mockEventBusService.dispatch).toHaveBeenCalledWith(makeExpectedAction('/some/modal', [], {}));
  });

  it('should populate selectedItems from Virtual Page Stack', () => {
    service.initialize();

    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();

    mockRouter.events.next(new NavigationEnd(1, '123', '123'));

    service.virtualRoute.next({
      type: 'push',
      url: 'my/test/url',
      selectedItems: {
        policyNumber: '123456789',
        emailSelected: 'current',
      },
    });

    expect(mockEventBusService.dispatch).toHaveBeenCalledWith(
      makeExpectedAction(
        '/my/test/url',
        [],
        {
          policyNumber: '123456789',
          emailSelected: 'current',
        },
        undefined,
        true
      )
    );
  });

  it('should populate customDimensions from Virtual Page Stack', () => {
    service.initialize();

    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();

    mockRouter.events.next(new NavigationEnd(1, '123', '123'));

    service.virtualRoute.next({
      type: 'push',
      url: 'my/test/url',
      selectedItems: {},
      customDimensions: { dataValue: 'top' },
    });

    expect(mockEventBusService.dispatch).toHaveBeenCalledWith(
      makeExpectedAction(
        '/my/test/url',
        [],
        {},
        {
          dataValue: 'top',
        },
        true
      )
    );
  });

  it('should add to virtual page stack', () => {
    service.initialize();
    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();

    mockRouter.events.next(new NavigationEnd(1, '123', '123'));
    service.virtualRoute.next({ type: 'push', url: '/test/url' });
    service.virtualRoute.next({ type: 'push', url: '/test/url2' });

    expect(mockEventBusService.dispatch.calls.argsFor(0)).toEqual([makeExpectedAction('/my/path', [], {})]);
    expect(mockEventBusService.dispatch.calls.argsFor(1)).toEqual([
      makeExpectedAction('/test/url', [], {}, undefined, true),
    ]);
    expect(mockEventBusService.dispatch.calls.argsFor(2)).toEqual([
      makeExpectedAction('/test/url2', [], {}, undefined, true),
    ]);
  });

  it('should dispatch event for the last virtual page stack if there any left', () => {
    service.initialize();
    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();

    mockRouter.events.next(new NavigationEnd(1, '123', '123'));
    service.virtualRoute.next({ type: 'push', url: '/test/url' });
    service.virtualRoute.next({ type: 'push', url: '/test/url2' });
    service.virtualRoute.next({ type: 'pop', url: '/test/url2' });

    expect(mockEventBusService.dispatch.calls.argsFor(0)).toEqual([makeExpectedAction('/my/path', [], {})]);
    expect(mockEventBusService.dispatch.calls.argsFor(1)).toEqual([
      makeExpectedAction('/test/url', [], {}, undefined, true),
    ]);
    expect(mockEventBusService.dispatch.calls.argsFor(2)).toEqual([
      makeExpectedAction('/test/url2', [], {}, undefined, true),
    ]);
    expect(mockEventBusService.dispatch.calls.argsFor(3)).toEqual([
      makeExpectedAction('/test/url', [], {}, undefined, true),
    ]);
  });

  it('should fall back to the last real navigation event if no more virtual page stacks exist', () => {
    service.initialize();
    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();

    mockRouter.events.next(new NavigationEnd(1, '123', '123'));

    service.virtualRoute.next({ type: 'push', url: '/test/url' });
    service.virtualRoute.next({ type: 'push', url: '/test/url2' });
    service.virtualRoute.next({ type: 'pop' });
    service.virtualRoute.next({ type: 'pop' });

    expect(mockEventBusService.dispatch.calls.argsFor(0)).toEqual([makeExpectedAction('/my/path', [], {})]);
    expect(mockEventBusService.dispatch.calls.argsFor(1)).toEqual([
      makeExpectedAction('/test/url', [], {}, undefined, true),
    ]);
    expect(mockEventBusService.dispatch.calls.argsFor(2)).toEqual([
      makeExpectedAction('/test/url2', [], {}, undefined, true),
    ]);
    expect(mockEventBusService.dispatch.calls.argsFor(3)).toEqual([
      makeExpectedAction('/test/url', [], {}, undefined, true),
    ]);
    expect(mockEventBusService.dispatch.calls.argsFor(4)).toEqual([makeExpectedAction('/my/path')]);
  });

  it('should clear the virtual page stack if a real navigation event happens', () => {
    service.initialize();
    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();

    mockRouter.events.next(new NavigationEnd(1, '123', '123'));

    service.virtualRoute.next({ type: 'push', url: '/test/url' });
    service.virtualRoute.next({ type: 'push', url: '/test/url2' });
    mockRouter.events.next(new NavigationEnd(1, '123', '123'));
    expect(mockEventBusService.dispatch.calls.argsFor(0)).toEqual([makeExpectedAction('/my/path', [], {})]);
    expect(mockEventBusService.dispatch.calls.argsFor(1)).toEqual([
      makeExpectedAction('/test/url', [], {}, undefined, true),
    ]);
    expect(mockEventBusService.dispatch.calls.argsFor(2)).toEqual([
      makeExpectedAction('/test/url2', [], {}, undefined, true),
    ]);
    expect(mockEventBusService.dispatch.calls.argsFor(3)).toEqual([makeExpectedAction('/my/path')]);
  });

  it('should append additional scopes if defined on route data', () => {
    const expectedAction = makeExpectedAction('/my/path', ['Additional Scope'], {});
    spyOn(service, 'getAdditionalScopes').and.returnValue(['Additional Scope']);

    service.initialize();

    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();
    mockRouter.events.next(new NavigationEnd(1, '123', '123'));
    expect(mockEventBusService.dispatch).toHaveBeenCalledWith(expectedAction);
  });

  it('should use additional page scopes and selected items in virtual route, if provided', () => {
    const expectedRealAction = makeExpectedAction('/my/path', [], {});
    const expectedVirtualAction = makeExpectedAction(
      '/test/url',
      ['Additional Scope'],
      {
        policyNumber: '123456789',
        emailSelected: 'current',
      },
      undefined,
      true
    );

    service.initialize();

    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();

    mockRouter.events.next(new NavigationEnd(1, '123', '123'));
    service.virtualRoute.next({
      type: 'push',
      url: '/test/url',
      additionalScopes: ['Additional Scope'],
      selectedItems: {
        policyNumber: '123456789',
        emailSelected: 'current',
      },
    });

    expect(mockEventBusService.dispatch).toHaveBeenCalledWith(expectedRealAction);
    expect(mockEventBusService.dispatch).toHaveBeenCalledWith(expectedVirtualAction);
  });

  it('should use router data if router has it available', () => {
    const mockRouterData: any = {
      routerState: {
        root: {
          snapshot: {
            firstChild: {
              data: {
                analytics: {
                  additionalScopes: ['Additional Scope'],
                },
              },
            },
          },
        },
      },
    };
    const expected = ['Additional Scope'];
    const actual = service.getAdditionalScopes(mockRouterData);
    expect(actual).toEqual(expected);
  });

  it('should return an empty array if router data is not available', () => {
    const mockRouterData: any = {
      routerState: {
        root: {
          snapshot: {
            firstChild: {},
          },
        },
      },
    };

    const expected: string[] = [];
    const actual = service.getAdditionalScopes(mockRouterData);
    expect(actual).toEqual(expected);
  });

  it('should return an empty array if router data is available but no additional scopes', () => {
    const mockRouterData: any = {
      routerState: {
        root: {
          snapshot: {
            firstChild: {
              data: {},
            },
          },
        },
      },
    };

    const expected: string[] = [];
    const actual = service.getAdditionalScopes(mockRouterData);
    expect(actual).toEqual(expected);
  });

  it(`should prefix the virtual page name with '/' if it does not start with one`, () => {
    service.initialize();

    mockRouter.events.next(new NavigationEnd(1, '123', '123'));
    service.virtualRoute.next({ type: 'push', url: 'test/url' });

    expect(mockEventBusService.dispatch).toHaveBeenCalledWith(makeExpectedAction('/test/url', [], {}, undefined, true));
  });

  describe('getPrettyRouteName', () => {
    describe('when the route is eagerly loaded', () => {
      it('should return undefined if there are no params', () => {
        const mockRouterData: any = {
          routerState: {
            root: {
              snapshot: {
                firstChild: {
                  paramMap: convertToParamMap({}),
                  routeConfig: {
                    path: '',
                  },
                  firstChild: {
                    paramMap: convertToParamMap({}),
                    routeConfig: {
                      path: 'account-home',
                    },
                    firstChild: {
                      paramMap: convertToParamMap({}),
                      routeConfig: {
                        path: 'account-options',
                      },
                      firstChild: null,
                    },
                  },
                },
              },
            },
          },
        };

        expect(service.getPrettyRouteName(mockRouterData)).toBeUndefined();
      });

      describe('when the route has params', () => {
        it('should return the route config path with NO params inserted if the route DOES NOT have preservedParams keys', () => {
          const paramMap = {
            policyNumber: '622059871',
            termId: '0',
          };
          const mockRouterData: any = {
            routerState: {
              root: {
                snapshot: {
                  firstChild: {
                    paramMap: convertToParamMap({}),
                    routeConfig: {
                      path: '',
                    },
                    firstChild: {
                      paramMap: convertToParamMap({}),
                      routeConfig: {
                        path: 'id-card-hub',
                      },
                      firstChild: {
                        paramMap: convertToParamMap(paramMap),
                        routeConfig: {
                          path: ':policyNumber/:termId/id-card',
                        },
                        firstChild: null,
                      },
                    },
                  },
                },
              },
            },
          };
          mockRouterUtilityService.getSnapshotHierarchyAsArray = () => {
            return [
              { routeConfig: { path: '' }, paramMap: convertToParamMap({}) },
              { routeConfig: { path: 'id-card-hub' }, paramMap: convertToParamMap({}) },
              { routeConfig: { path: ':policyNumber/:termId/id-card' }, paramMap: convertToParamMap(paramMap) },
            ];
          };

          const expected = `/id-card-hub/:policyNumber/:termId/id-card`;
          const actual = service.getPrettyRouteName(mockRouterData);
          expect(actual).toEqual(expected);
        });

        it('should return the route config path with params inserted if the route has replaceParamTokens keys', () => {
          const paramMap = {
            policyNumber: '622059871',
            termId: '0',
          };
          const mockRouterData: any = {
            routerState: {
              root: {
                snapshot: {
                  firstChild: {
                    paramMap: convertToParamMap({}),
                    routeConfig: {
                      path: '',
                    },
                    firstChild: {
                      paramMap: convertToParamMap({}),
                      routeConfig: {
                        path: 'id-card-hub',
                      },
                      firstChild: {
                        paramMap: convertToParamMap(paramMap),
                        routeConfig: {
                          data: {
                            analytics: {
                              replaceParamTokens: ['termId'],
                            },
                          },
                          path: ':policyNumber/:termId/id-card',
                        },
                        firstChild: null,
                      },
                    },
                  },
                },
              },
            },
          };

          const expected = '/id-card-hub/:policyNumber/0/id-card';
          mockRouterUtilityService.getSnapshotHierarchyAsArray = () => {
            return [
              { routeConfig: { path: '' }, paramMap: convertToParamMap({}) },
              { routeConfig: { path: 'id-card-hub' }, paramMap: convertToParamMap({}) },
              {
                routeConfig: {
                  path: ':policyNumber/:termId/id-card',
                  data: { analytics: { replaceParamTokens: ['termId'] } },
                },
                paramMap: convertToParamMap(paramMap),
              },
            ];
          };
          mockRouterUtilityService.replaceTokensWithValuesFromParamMap = () => expected;

          const actual = service.getPrettyRouteName(mockRouterData);
          expect(actual).toEqual(expected);
        });
      });
    });

    describe('when the route is lazy loaded', () => {
      it('should return undefined if there are no params', () => {
        const mockRouterData: any = {
          routerState: {
            root: {
              snapshot: {
                firstChild: {
                  paramMap: convertToParamMap({}),
                  routeConfig: {
                    path: '',
                  },
                  firstChild: {
                    paramMap: convertToParamMap({}),
                    routeConfig: {
                      path: 'account-home',
                    },
                    firstChild: {
                      paramMap: convertToParamMap({}),
                      routeConfig: {
                        path: '',
                      },
                      firstChild: null,
                    },
                  },
                },
              },
            },
          },
        };

        expect(service.getPrettyRouteName(mockRouterData)).toBeUndefined();
      });

      describe('when the route has params', () => {
        it('should return the route config path with NO params inserted if the route DOES NOT have preservedParams keys', () => {
          const paramMap = {
            policyNumber: '622059871',
          };
          const mockRouterData: any = {
            routerState: {
              root: {
                snapshot: {
                  firstChild: {
                    paramMap: convertToParamMap({}),
                    routeConfig: {
                      path: '',
                    },
                    firstChild: {
                      paramMap: convertToParamMap({}),
                      routeConfig: {
                        path: 'account-home',
                      },
                      firstChild: {
                        paramMap: convertToParamMap(paramMap),
                        routeConfig: {
                          path: ':policyNumber',
                        },
                        firstChild: null,
                      },
                    },
                  },
                },
              },
            },
          };

          mockRouterUtilityService.getSnapshotHierarchyAsArray = () => {
            return [
              { routeConfig: { path: '' }, paramMap: convertToParamMap({}) },
              { routeConfig: { path: 'account-home' }, paramMap: convertToParamMap({}) },
              {
                routeConfig: {
                  path: ':policyNumber',
                },
                paramMap: convertToParamMap(paramMap),
              },
            ];
          };

          const expected = '/account-home/:policyNumber';
          const actual = service.getPrettyRouteName(mockRouterData);
          expect(actual).toEqual(expected);
        });

        it('should return the route config path with params inserted if the route has replaceParamTokens keys', () => {
          const paramMap = {
            policyNumber: '622059871',
          };
          const mockRouterData: any = {
            routerState: {
              root: {
                snapshot: {
                  firstChild: {
                    paramMap: convertToParamMap({}),
                    routeConfig: {
                      path: '',
                    },
                    firstChild: {
                      paramMap: convertToParamMap({}),
                      routeConfig: {
                        path: 'account-home',
                      },
                      firstChild: {
                        paramMap: convertToParamMap(paramMap),
                        routeConfig: {
                          data: {
                            analytics: {
                              replaceParamTokens: ['policyNumber'],
                            },
                          },
                          path: 'policy-options/:policyNumber',
                        },
                        firstChild: null,
                      },
                    },
                  },
                },
              },
            },
          };

          const expected = '/account-home/policy-options/622059871';
          mockRouterUtilityService.getSnapshotHierarchyAsArray = () => {
            return [
              { routeConfig: { path: '' }, paramMap: convertToParamMap({}) },
              { routeConfig: { path: 'account-home' }, paramMap: convertToParamMap({}) },
              {
                routeConfig: {
                  path: 'policy-options/:policyNumber',
                  data: { analytics: { replaceParamTokens: ['policyNumber'] } },
                },
                paramMap: convertToParamMap(paramMap),
              },
            ];
          };
          mockRouterUtilityService.replaceTokensWithValuesFromParamMap = () => expected;
          const actual = service.getPrettyRouteName(mockRouterData);
          expect(actual).toEqual(expected);
        });
      });
    });
  });

  it('should use the routeConfig path for logging if route has params', () => {
    spyOn(service, 'getPrettyRouteName').and.returnValue('/i-am-pretty');
    service.initialize();
    expect(mockEventBusService.dispatch).not.toHaveBeenCalled();

    mockRouter.events.next(new NavigationEnd(1, '123', '123'));
    expect(mockEventBusService.dispatch).toHaveBeenCalledWith(makeExpectedAction('/i-am-pretty', [], {}));
  });

  describe('getSelectedItems', () => {
    it('returns selected params from the routing object when params are populated', () => {
      const params: Params = {
        claimNumber: '20173876099',
        policyNumber: '622018883',
      };
      const mockRouterData: Router = {
        routerState: {
          root: {
            snapshot: {
              firstChild: {
                paramMap: convertToParamMap(params),
              },
            },
          },
        },
      } as Router;

      expect(service.getSelectedRouteParamsItems(mockRouterData)).toEqual(params);
    });

    it('returns an empty object when there are no router params', () => {
      const params: Params = {};
      const mockRouterData: Router = {
        routerState: {
          root: {
            snapshot: {
              firstChild: {
                paramMap: convertToParamMap(params),
              },
            },
          },
        },
      } as Router;

      expect(service.getSelectedRouteParamsItems(mockRouterData)).toEqual(params);
    });
  });

  describe('shouldTrack', () => {
    it('returns true when snapshot.data is undefined', () => {
      const router: any = {
        routerState: {
          root: {
            snapshot: {},
          },
        },
      };
      expect(service.shouldTrack(router)).toBeTruthy();
    });
    it('returns true when snapshot.data.analytics is undefined', () => {
      const router: any = {
        routerState: {
          root: {
            snapshot: { data: {} },
          },
        },
      };
      expect(service.shouldTrack(router)).toBeTruthy();
    });
    it('returns true when snapshot.data.analytics does not contain disableAutoPageViewEvent property', () => {
      const router: any = {
        routerState: {
          root: {
            snapshot: {
              data: {
                analytics: {},
              },
            },
          },
        },
      };
      expect(service.shouldTrack(router)).toBeTruthy();
    });
    it('returns true when snapshot.data.analytics.disableAutoPageViewEvent is false', () => {
      const router: any = {
        routerState: {
          root: {
            snapshot: { data: { analytics: { disableAutoPageViewEvent: false } } },
          },
        },
      };
      expect(service.shouldTrack(router)).toBeTruthy();
    });
    it('returns false only when snapshot.data.analytics.disableAutoPageViewEvent is explicitly set to true', () => {
      const router: any = {
        routerState: {
          root: {
            snapshot: { data: { analytics: { disableAutoPageViewEvent: true } } },
          },
        },
      };
      expect(service.shouldTrack(router)).toBeFalsy();
    });
  });

  describe('shouldIncludeAppScope', () => {
    it('returns true when snapshot.data is undefined', () => {
      const router: any = {
        routerState: {
          root: {
            snapshot: {},
          },
        },
      };
      expect(service.shouldIncludeAppScope(router)).toBeTruthy();
    });
    it('returns true when snapshot.data.analytics is undefined', () => {
      const router: any = {
        routerState: {
          root: {
            snapshot: { data: {} },
          },
        },
      };
      expect(service.shouldIncludeAppScope(router)).toBeTruthy();
    });
    it('returns true when snapshot.data.analytics does not contain excludeAppScope property', () => {
      const router: any = {
        routerState: {
          root: {
            snapshot: {
              data: {
                analytics: {},
              },
            },
          },
        },
      };
      expect(service.shouldIncludeAppScope(router)).toBeTruthy();
    });
    it('returns true when snapshot.data.analytics.excludeAppScope is false', () => {
      const router: any = {
        routerState: {
          root: {
            snapshot: { data: { analytics: { excludeAppScope: false } } },
          },
        },
      };
      expect(service.shouldIncludeAppScope(router)).toBeTruthy();
    });
    it('returns false only when snapshot.data.analytics.excludeAppScope is explicitly set to true', () => {
      const router: any = {
        routerState: {
          root: {
            snapshot: { data: { analytics: { excludeAppScope: true } } },
          },
        },
      };
      expect(service.shouldIncludeAppScope(router)).toBeFalsy();
    });
  });
});
