export function parseExcelDate(excelDate: string | number): string | undefined {
  if (!excelDate) return undefined;

  let date: Date;

  if (typeof excelDate === 'number') {
    // Excel stores dates as number of days since January 1, 1900
    date = new Date((excelDate - 25569) * 86400 * 1000);
  } else {
    // If it's already a string, try to parse it
    date = new Date(excelDate);
  }

  if (isNaN(date.getTime())) {
    console.error(`Invalid date: ${excelDate}`);
    return undefined;
  }

  // Format the date as YYYY-MM-DD
  return date.toISOString().split('T')[0];
}
