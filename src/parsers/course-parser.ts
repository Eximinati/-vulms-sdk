import * as cheerio from 'cheerio';
import type { Course } from '../types/course';
import { noopLogger, type Logger } from '../utils/logger';

export function parseCoursesFromHome(html: string, debug: Logger = noopLogger): Course[] {
  const log = debug;
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const courses: Course[] = [];

  log.debug(`parseCoursesFromHome: HTML length=${html.length}`);

  $('a[href*="Course.aspx"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();

    if (!text && !href) return;

    const codeFromHref = extractCodeFromHref(href);
    const codeFromText = extractCodeFromText(text);
    const code = codeFromHref || codeFromText;
    if (!code || seen.has(code)) return;

    seen.add(code);
    courses.push({
      code,
      title: extractTitle(text, code),
    });
    log.debug(`  Course from link: ${code} - ${extractTitle(text, code)}`);
  });

  if (courses.length > 0) {
    log.info(`parseCoursesFromHome: ${courses.length} courses from links`);
    return courses;
  }

  $('[id^="MainContent_gvCourseList_ibtnAssignments_"]').each((_: number, el) => {
    const card = $(el).closest('.m-portlet');
    const h3 = card.find('h3').first();
    const h3Text = h3.text().trim();
    const code = extractCodeFromText(h3Text);
    if (code && !seen.has(code)) {
      seen.add(code);
      courses.push({
        code,
        title: extractTitle(h3Text, code),
      });
      log.debug(`  Course from portlet: ${code} - ${extractTitle(h3Text, code)}`);
    }
  });

  log.info(`parseCoursesFromHome: ${courses.length} courses from portlets`);
  return courses;
}

function extractCodeFromHref(href: string): string | null {
  const match = href.match(/[?&]code=([^&]+)/i);
  return match ? match[1].toUpperCase() : null;
}

function extractCodeFromText(text: string): string | null {
  const match = text.match(/^([A-Z]{2,4}\d{3}[A-Z]?)\b/i);
  return match ? match[1].toUpperCase() : null;
}

function extractTitle(fullText: string, code: string): string {
  const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const title = fullText.replace(new RegExp(`^${escaped}\\s*-?\\s*`, 'i'), '').trim();
  const firstLine = title.split(/\n/)[0].trim();
  return firstLine || code;
}