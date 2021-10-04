import { ActivatedRouteSnapshot } from '@angular/router';

export const getSnapshotHierarchyAsArray = (snapshots: ActivatedRouteSnapshot[]): ActivatedRouteSnapshot[] => {
  return snapshots[snapshots.length - 1].firstChild ?
    getSnapshotHierarchyAsArray(snapshots.concat(snapshots[snapshots.length - 1].firstChild as ActivatedRouteSnapshot)) :
    snapshots;
};
