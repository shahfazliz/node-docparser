import moment from 'moment';

export const startOfDayInUTC = moment
  .utc(moment()
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
    .set('millisecond', 0))
  .format();
