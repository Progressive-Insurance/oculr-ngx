import { EventModel } from '../models/event-model.class';

export const timeoutErrorStatusCode = '-1001';
export const unknownErrorStatusCode = '0';

export const getEmptyEventModel = () => {
  return new EventModel('', '', '', '', '', '', '', 0, {}, [], '', '', {});
};
