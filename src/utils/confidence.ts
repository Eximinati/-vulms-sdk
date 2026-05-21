import * as cheerio from 'cheerio';

export interface ParseWarning {
  code: string;
  message: string;
  selector?: string;
  context?: string;
}

export interface ParseConfidence {
  confidence: number;
  extracted: number;
  skipped: number;
  warnings: ParseWarning[];
  fingerprint: string;
}

export function emptyConfidence(fingerprint: string): ParseConfidence {
  return { confidence: 0, extracted: 0, skipped: 0, warnings: [], fingerprint };
}

export function buildConfidence(
  extracted: number,
  expected: number,
  skipped: number,
  warnings: ParseWarning[],
  fingerprint: string,
): ParseConfidence {
  const base = expected > 0 ? extracted / expected : 0;
  const skipPenalty = skipped > 0 ? Math.min(skipped * 0.05, 0.3) : 0;
  const warningPenalty = Math.min(warnings.length * 0.02, 0.2);
  const confidence = Math.max(0, Math.min(1, base - skipPenalty - warningPenalty));
  return { confidence: Math.round(confidence * 100) / 100, extracted, skipped, warnings, fingerprint };
}

export function isLowConfidence(result: ParseConfidence, threshold = 0.5): boolean {
  return result.confidence < threshold;
}

export function fingerprintHtml(html: string, prefix: string): string {
  const $ = cheerio.load(html);
  const sig: string[] = [prefix];
  sig.push($('table').length ? `tables:${$('table').length}` : 'no-tables');
  sig.push($('form').length ? `forms:${$('form').length}` : 'no-forms');
  const vs = html.includes('__VIEWSTATE');
  const ev = html.includes('__EVENTVALIDATION');
  sig.push(`vs:${vs ? 1 : 0}`);
  sig.push(`ev:${ev ? 1 : 0}`);
  const tile = html.includes('gvTileRepeater');
  const grid = html.includes('GridView') || html.includes('gvCourseList');
  sig.push(`tile:${tile ? 1 : 0}`);
  sig.push(`grid:${grid ? 1 : 0}`);
  sig.push(`bodylen:${$('body').text().trim().length}`);
  return sig.join('|');
}
