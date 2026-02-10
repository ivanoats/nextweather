/**
 * @param {number} ms - meters per second
 * @return {number} miles per hour
 */
export default function metersPerSecondToMph(ms: number): number {
  return ms * 2.23694
}

/**
 * @param {number} celsius - temperature in Celsius
 * @return {number} temperature in Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return celsius * 9 / 5 + 32
}