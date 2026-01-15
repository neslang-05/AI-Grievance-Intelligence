/**
 * Reference ID Generator
 * Generates unique 8-character alphanumeric reference IDs for complaints
 * Format: 2 letters (dept code) + 6 alphanumeric characters
 * Example: PW7K2M9X, MC3N8Q5L
 */

// Department code mapping
const DEPT_CODES: Record<string, string> = {
  "Municipal Corporation": "MC",
  "Public Works Department": "PW",
  "Water Resources": "WR",
  "Electricity Department": "ED",
  "Police Department": "PD",
  "Health Department": "HD",
  "Transport Department": "TD",
  "Urban Development": "UD",
  "Forest Department": "FD",
  "District Administration": "DA",
}

// URL-safe alphanumeric characters (excluding similar-looking: 0/O, 1/I/l)
const SAFE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"

/**
 * Generate a random alphanumeric string of specified length
 */
function generateRandomString(length: number): string {
  let result = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * SAFE_CHARS.length)
    result += SAFE_CHARS[randomIndex]
  }
  return result
}

/**
 * Get department code from department name
 */
function getDepartmentCode(department: string): string {
  return DEPT_CODES[department] || "GC" // GC = General Complaint
}

/**
 * Generate a unique reference ID
 * @param department - The department name
 * @param existingIds - Optional array of existing IDs to check for collisions
 * @returns 8-character reference ID
 */
export function generateReferenceId(
  department: string,
  existingIds: string[] = []
): string {
  const deptCode = getDepartmentCode(department)
  let referenceId: string
  let attempts = 0
  const maxAttempts = 100

  do {
    const randomPart = generateRandomString(6)
    referenceId = `${deptCode}${randomPart}`
    attempts++

    if (attempts >= maxAttempts) {
      // Fallback: add timestamp to ensure uniqueness
      const timestamp = Date.now().toString(36).slice(-4).toUpperCase()
      referenceId = `${deptCode}${timestamp}${generateRandomString(2)}`
      break
    }
  } while (existingIds.includes(referenceId))

  return referenceId
}

/**
 * Validate reference ID format
 */
export function isValidReferenceId(referenceId: string): boolean {
  if (referenceId.length !== 8) return false
  
  // First 2 chars should be letters
  const deptCode = referenceId.slice(0, 2)
  if (!/^[A-Z]{2}$/.test(deptCode)) return false
  
  // Remaining 6 chars should be alphanumeric
  const randomPart = referenceId.slice(2)
  const validCharsRegex = new RegExp(`^[${SAFE_CHARS}]{6}$`)
  return validCharsRegex.test(randomPart)
}

/**
 * Format reference ID for display (adds hyphen for readability)
 * Example: PW7K2M9X -> PW-7K2M9X
 */
export function formatReferenceId(referenceId: string): string {
  if (referenceId.length !== 8) return referenceId
  return `${referenceId.slice(0, 2)}-${referenceId.slice(2)}`
}
