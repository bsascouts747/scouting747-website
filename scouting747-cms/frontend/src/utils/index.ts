export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  });
}

// ==========================================
// 📅 GOOGLE CALENDAR DATE HELPERS
// ==========================================
//
// Google Calendar's API represents events two different ways:
//   - Timed events:   start.dateTime = "2026-09-18T18:30:00-05:00" (a real instant)
//   - All-day events: start.date     = "2026-09-18"                (bare digits, no time/offset)
//
// `new Date("2026-09-18")` is parsed as UTC midnight per the JS spec. If that
// value is then formatted with `timeZone: "America/Chicago"` (UTC-5/-6), it
// rolls back to the *previous* day (e.g. Sep 17, 7pm) — that's the "shows one
// day early" bug. All-day dates must be read as plain calendar digits and
// NEVER passed through a timezone conversion. Only real timed instants
// (`dateTime`) should get `timeZone: "America/Chicago"`.

type CalendarEventTime = { date?: string; dateTime?: string };

/** Parse a bare "YYYY-MM-DD" string as a local wall-clock date (no UTC round-trip). */
function parseCalendarDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Google's all-day `end.date` is EXCLUSIVE — one day past the actual last
 * day of the event (this is also how the Google Calendar UI's own editor
 * computes what it stores, even though it *displays* an inclusive end date
 * to the user). Subtract a day to get the last day that's actually part of
 * the event.
 */
function inclusiveAllDayEnd(dateStr: string): Date {
  const d = parseCalendarDateOnly(dateStr);
  d.setDate(d.getDate() - 1);
  return d;
}

/** Sort-safe Date for a Google Calendar event's start, all-day or timed. */
export function getEventSortDate(event: { start: CalendarEventTime }): Date {
  return event.start.date && !event.start.dateTime
    ? parseCalendarDateOnly(event.start.date)
    : new Date(event.start.dateTime!);
}

export interface EventDateInfo {
  isAllDay: boolean;
  isMultiDay: boolean;
  month: string;
  day: string;
  year: string;
  weekday: string;
  time: string;
  /** e.g. "Sep 18" (single day) or "Sep 18 – Sep 20" / "Dec 30 – Jan 1" (range) */
  dateLabel: string;
  /** e.g. "Sep 18, 2026" or "Sep 18 – Sep 20, 2026" or "Dec 30, 2026 – Jan 1, 2027" */
  fullDateLabel: string;
}

export function getEventDateInfo(
  start: CalendarEventTime,
  end?: CalendarEventTime,
): EventDateInfo {
  const isAllDay = !!start.date && !start.dateTime;

  const startDate = isAllDay
    ? parseCalendarDateOnly(start.date!)
    : new Date(start.dateTime!);

  const endDate = isAllDay && end?.date ? inclusiveAllDayEnd(end.date) : undefined;

  // Timed events carry a real UTC instant and need conversion to Central.
  // All-day events are already the correct local calendar date — converting
  // them through a timezone is exactly what causes the off-by-one bug.
  const tz = isAllDay ? {} : { timeZone: "America/Chicago" as const };

  const month = startDate.toLocaleString("en-US", { month: "short", ...tz });
  const day = startDate.toLocaleString("en-US", { day: "numeric", ...tz });
  const year = startDate.toLocaleString("en-US", { year: "numeric", ...tz });
  const weekday = startDate.toLocaleString("en-US", { weekday: "long", ...tz });
  const time = isAllDay
    ? ""
    : startDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Chicago",
      });

  const isMultiDay = !!endDate && endDate.getTime() !== startDate.getTime();

  let dateLabel = `${month} ${day}`;
  let fullDateLabel = `${month} ${day}, ${year}`;

  if (isMultiDay && endDate) {
    const endMonth = endDate.toLocaleString("en-US", { month: "short" });
    const endDay = endDate.toLocaleString("en-US", { day: "numeric" });
    const endYear = endDate.toLocaleString("en-US", { year: "numeric" });

    dateLabel =
      endMonth === month
        ? `${month} ${day} – ${endDay}`
        : `${month} ${day} – ${endMonth} ${endDay}`;

    fullDateLabel =
      endYear === year
        ? `${dateLabel}, ${year}`
        : `${month} ${day}, ${year} – ${endMonth} ${endDay}, ${endYear}`;
  }

  return { isAllDay, isMultiDay, month, day, year, weekday, time, dateLabel, fullDateLabel };
}
