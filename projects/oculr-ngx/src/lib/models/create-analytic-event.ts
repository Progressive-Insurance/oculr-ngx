import { AnalyticEvent } from "./analytic-event.interface";
import { emptyAnalyticEventModel } from "./empty-analytic-event";

export const createAnalyticEvent = (event: Partial<AnalyticEvent>): AnalyticEvent => ({
  ...emptyAnalyticEventModel,
  ...event,
});
