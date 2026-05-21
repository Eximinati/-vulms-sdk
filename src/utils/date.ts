const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function parseVulmsDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const str = dateStr.trim().replace(/\s+/g, ' ');
  if (!str) return null;

  if (str.toLowerCase() === 'n/a' || str === '-' || str === '---') return null;

  const mmmMatch = str.match(
    /^(\d{1,2})\s*[-/.]\s*([A-Za-z]{3,})\s*[-/.]\s*(\d{4})$/,
  );
  if (mmmMatch) {
    const month = MONTH_MAP[mmmMatch[2].toLowerCase().slice(0, 3)];
    if (month !== undefined) {
      const d = new Date(parseInt(mmmMatch[3]), month, parseInt(mmmMatch[1]));
      if (!isNaN(d.getTime())) return d;
    }
  }

  const numericMatch = str.match(
    /^(\d{1,4})\s*[/.-]\s*(\d{1,2})\s*[/.-]\s*(\d{1,4})$/,
  );
  if (numericMatch) {
    const a = parseInt(numericMatch[1]);
    const b = parseInt(numericMatch[2]);
    const y = parseInt(numericMatch[3]);
    const year = y > 1000 ? y : y + 2000;

    if (a > 12) {
      const d = new Date(year, b - 1, a);
      if (!isNaN(d.getTime())) return d;
    }
    if (b > 12) {
      const d = new Date(year, a - 1, b);
      if (!isNaN(d.getTime())) return d;
    }
    const d = new Date(year, b - 1, a);
    if (!isNaN(d.getTime())) return d;
  }

  const longMatch = str.match(
    /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/,
  );
  if (longMatch) {
    const d = new Date(`${longMatch[1]} ${longMatch[2]}, ${longMatch[3]}`);
    if (!isNaN(d.getTime())) return d;
  }

  const longWithTimeMatch = str.match(
    /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
  );
  if (longWithTimeMatch) {
    const monthName = longWithTimeMatch[1];
    const day = parseInt(longWithTimeMatch[2]);
    const year = parseInt(longWithTimeMatch[3]);
    let hours = parseInt(longWithTimeMatch[4]);
    const minutes = parseInt(longWithTimeMatch[5]);
    const ampm = longWithTimeMatch[6].toUpperCase();
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    const month = MONTH_MAP[monthName.toLowerCase().slice(0, 3)];
    if (month !== undefined) {
      const d = new Date(year, month, day, hours, minutes);
      if (!isNaN(d.getTime())) return d;
    }
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed;

  const ts = parseInt(str);
  if (!isNaN(ts) && ts > 1000000000) {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}
