/**
 * Pads a single-digit number with a leading zero.
 *
 * @param num - The number to format
 * @returns A string with a leading zero if the number is single-digit,
 *          otherwise the number as a string
 *
 * @example
 * leadingZero(5)   // Returns "05"
 * leadingZero(12)  // Returns "12"
 */
export default function leadingZero(num: number): string {
  return `${num}`.length === 1 ? `0` + `${num}` : `${num}`
}
