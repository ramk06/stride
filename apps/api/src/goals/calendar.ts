import { UnprocessableEntityException } from '@nestjs/common';
import { DateTime } from 'luxon';

type CalendarGoal = { startsOn: string; endsOn: string; timezone: string; period: string };
export function validateCalendar(goal: CalendarGoal) {
  const start = DateTime.fromISO(goal.startsOn, { zone: goal.timezone }).startOf('day');
  const end = DateTime.fromISO(goal.endsOn, { zone: goal.timezone }).startOf('day');
  if (!start.isValid || !end.isValid || start.toISODate() !== goal.startsOn || end.toISODate() !== goal.endsOn || end < start || end.diff(start, 'years').years > 10) {
    throw new UnprocessableEntityException('Use valid local dates, ordered within ten years.');
  }
  return { start, end: end.plus({ days: 1 }) };
}
export function goalPeriod(goal: CalendarGoal, now: Date) {
  const range = validateCalendar(goal);
  const local = DateTime.fromJSDate(now, { zone: goal.timezone });
  if (goal.period === 'custom') return { start: range.start.toJSDate(), end: range.end.toJSDate() };
  const unit = goal.period === 'week' ? 'week' : 'month';
  const anchor = local < range.start ? range.start : local >= range.end ? range.end.minus({ milliseconds: 1 }) : local;
  const start = anchor.startOf(unit);
  const end = start.plus(unit === 'week' ? { weeks: 1 } : { months: 1 });
  return { start: (start < range.start ? range.start : start).toJSDate(), end: (end > range.end ? range.end : end).toJSDate() };
}