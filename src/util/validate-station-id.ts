/**
 * Validates station IDs to prevent Server-Side Request Forgery (SSRF) attacks.
 * Station IDs should contain only alphanumeric characters and be within reasonable length.
 */

/**
 * Validates a weather station ID format.
 *
 * Valid station IDs:
 * - NDBC/NWS stations: typically 4-5 uppercase alphanumeric characters (e.g., WPOW1, KSEA)
 * - Tide stations: typically 7 numeric characters (e.g., 9447130)
 *
 * @param stationId - The station ID to validate
 * @param maxLength - Maximum allowed length (default: 10)
 * @returns true if valid, false otherwise
 */
export function isValidStationId(
  stationId: string,
  maxLength: number = 10
): boolean {
  if (!stationId || typeof stationId !== 'string') {
    return false;
  }

  // Check length to prevent extremely long inputs
  if (stationId.length === 0 || stationId.length > maxLength) {
    return false;
  }

  // Only allow alphanumeric characters (prevents path traversal, URL manipulation)
  // This blocks: ../, http://, special chars, etc.
  const validPattern = /^[a-zA-Z0-9]+$/;
  return validPattern.test(stationId);
}

/**
 * Sanitizes a station ID by removing invalid characters.
 * If the result is invalid, returns the default value.
 *
 * @param stationId - The station ID to sanitize
 * @param defaultValue - Default value if sanitization fails
 * @param maxLength - Maximum allowed length
 * @returns Sanitized station ID or default value
 */
export function sanitizeStationId(
  stationId: string | undefined,
  defaultValue: string,
  maxLength: number = 10
): string {
  if (!stationId) {
    return defaultValue;
  }

  // Remove any non-alphanumeric characters
  const sanitized = stationId
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, maxLength);

  // Validate the sanitized result
  if (isValidStationId(sanitized, maxLength)) {
    return sanitized;
  }

  return defaultValue;
}
