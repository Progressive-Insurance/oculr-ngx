/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

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
