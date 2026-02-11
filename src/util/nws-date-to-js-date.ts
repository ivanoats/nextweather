/**
 * Converts a National Weather Service (NWS) date string to a localized date/time string.
 *
 * @param nwsdate - The NWS date string to convert (e.g., ISO 8601 format)
 * @returns A formatted string with localized date and time if parsing succeeds,
 *          or the original string if the date cannot be parsed
 *
 * @example
 * // Returns formatted date like "2/10/2026 3:45:00 PM"
 * NWSDateToJSDate("2026-02-10T15:45:00Z")
 *
 * @example
 * // Returns original string if unparseable
 * NWSDateToJSDate("invalid-date")
 */
export default function NWSDateToJSDate(nwsdate: string): Date | string {
  let jsdate: Date
  if (Number.isNaN(Date.parse(nwsdate))) {
    return nwsdate
  } else {
    jsdate = new Date(nwsdate)
    return `${jsdate.toLocaleDateString()} ${jsdate.toLocaleTimeString()}`
  }
}
