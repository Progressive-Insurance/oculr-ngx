import { getSnapshotHierarchyAsArray } from './get-snapshot-hierarchy-as-array';

describe('getSnapshotHierarchyAsArray', () => {
  let snapshot: any;
  it('converts a nested object hierarchy to an array', () => {
    snapshot = {
      outlet: 'one',
      firstChild: {
        outlet: 'child-of-one',
        firstChild: {
          outlet: 'child-of-child-of-one'
        }
      }
    };
    const expected = [
      snapshot,
      snapshot.firstChild,
      snapshot.firstChild.firstChild
    ];
    expect(getSnapshotHierarchyAsArray([snapshot])).toEqual(expected);
  });
  it('does nothing if there are no children', () => {
    snapshot = {
      outlet: 'one',
      firstChild: null
    };
    const expected = [
      snapshot
    ];
    expect(getSnapshotHierarchyAsArray([snapshot])).toEqual(expected);
  });
});
