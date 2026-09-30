import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { goalPeriod, validateCalendar } from '../src/goals/calendar';

test('weekly periods start Monday and account for spring DST', () => {
  const period = goalPeriod({ startsOn: '2026-01-01', endsOn: '2026-12-31', period: 'week', timezone: 'America/New_York' }, new Date('2026-03-08T15:00:00Z'));
  assert.equal(period.start.toISOString(), '2026-03-02T05:00:00.000Z');
  assert.equal(period.end.toISOString(), '2026-03-09T04:00:00.000Z');
  assert.equal((period.end.getTime() - period.start.getTime()) / 3600000, 167);
});
test('fall DST, custom inclusive dates, invalid dates and clipped periods', () => {
  const period = goalPeriod({ startsOn: '2026-01-01', endsOn: '2026-12-31', period: 'week', timezone: 'America/New_York' }, new Date('2026-11-01T15:00:00Z'));
  assert.equal((period.end.getTime() - period.start.getTime()) / 3600000, 169);
  const single = goalPeriod({ startsOn: '2026-03-08', endsOn: '2026-03-08', period: 'custom', timezone: 'America/New_York' }, new Date());
  assert.equal((single.end.getTime() - single.start.getTime()) / 3600000, 23);
  assert.throws(() => validateCalendar({ startsOn: '2026-02-30', endsOn: '2026-03-01', period: 'custom', timezone: 'UTC' }));
  const clipped = goalPeriod({ startsOn: '2026-03-04', endsOn: '2026-03-06', period: 'month', timezone: 'UTC' }, new Date('2026-03-05'));
  assert.equal(clipped.start.toISOString(), '2026-03-04T00:00:00.000Z');
  assert.equal(clipped.end.toISOString(), '2026-03-07T00:00:00.000Z');
});