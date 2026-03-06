/**
 * Helper to convert HH:mm to minutes
 */
export const timeToMinutes = (timeStr: string) => {
  const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

/**
 * Formats minutes back to HH:mm
 */
export const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};
