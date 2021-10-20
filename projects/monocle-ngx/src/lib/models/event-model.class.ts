export class EventModel {
  constructor(
    public eventId: string,
    public eventKey: string,
    public trackOn: string,
    public event: string,
    public eventCategory: string,
    public eventAction: string,
    public eventLabel: string,
    public eventValue: number | string | ((val: number) => number | string),
    public customDimensions: { [dimension: string]: unknown },
    public scopes: Array<string>,
    public milestoneName: string,
    public milestoneStatus: string,
    public selectedItems: { [selectedItems: string]: string }
  ) {}
}
