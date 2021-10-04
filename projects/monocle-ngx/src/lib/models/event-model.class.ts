export class EventModel {
  constructor(
    public eventId: string,
    public eventKey: string,
    public trackOn: string,
    public event: string,
    public eventCategory: string,
    public eventAction: string,
    public eventLabel: string,
    public eventValue: number | string | Function,
    public customDimensions: { [dimension: string]: any },
    public scopes: Array<string>,
    public milestoneName: string,
    public milestoneStatus: string,
    public selectedItems: { [selectedItems: string]: string }
  ) { }
}
