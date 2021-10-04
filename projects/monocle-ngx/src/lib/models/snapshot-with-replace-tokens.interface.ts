import { ActivatedRouteSnapshot } from '@angular/router';

export interface SnapshotWithReplaceTokens extends ActivatedRouteSnapshot {
  routeConfig: {
    path?: string;
    data: {
      analytics: {
        replaceParamTokens: string[];
      }
    }
  };
}
export const snapshotHasReplaceParamTokens = (snapshot: ActivatedRouteSnapshot): snapshot is SnapshotWithReplaceTokens => {
  return snapshot &&
    snapshot.routeConfig &&
    snapshot.routeConfig.data &&
    snapshot.routeConfig.data.analytics &&
    snapshot.routeConfig.data.analytics.replaceParamTokens &&
    snapshot.routeConfig.data.analytics.replaceParamTokens.length;
};
