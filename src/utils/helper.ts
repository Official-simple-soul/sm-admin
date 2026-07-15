export const generateContentKey = (
  title: string,
  collectionNum: number,
): string => {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${slug}-${collectionNum}`
}

export const safeToDate = (timestamp: any): Date | null => {
  if (!timestamp) return null

  // If it's a Firebase Timestamp object
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate()
  }

  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp
  }

  // If it's a string that can be parsed to Date
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp)
    return isNaN(date.getTime()) ? null : date
  }

  // If it's a number (milliseconds)
  if (typeof timestamp === 'number') {
    const date = new Date(timestamp)
    return isNaN(date.getTime()) ? null : date
  }

  return null
}
