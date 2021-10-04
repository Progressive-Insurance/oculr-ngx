import { HitDate } from '../models/hit-date.type';

import * as dateUtil from './date-util';

export const hitDate = () => dateUtil.formatDateWithTimezoneOffset(new Date()) as HitDate;
