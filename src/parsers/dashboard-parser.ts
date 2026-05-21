import * as cheerio from 'cheerio';
import type { DashboardCourse, DashboardActivityPreview } from '../types/dashboard';
import { extractCodeFromText } from '../utils/activity';
import { noopLogger, type Logger } from '../utils/logger';

export interface ParseDashboardOptions {
  courseCode?: string;
}

export function parseDashboard(html: string, debug: Logger = noopLogger, _options: ParseDashboardOptions = {}): DashboardCourse[] {
  const log = debug;
  const $ = cheerio.load(html);

  log.debug(`parseDashboard: parsing HTML, length=${html.length}`);

  const courses: DashboardCourse[] = [];

  const courseCards = $('[id^="MainContent_gvCourseList_"]');
  const seen = new Set<string>();

  courseCards.each((_, el) => {
    const card = $(el).closest('.m-portlet');
    const h3 = card.find('h3').first();
    const h3Text = h3.text().trim();

    const codeMatch = h3Text.match(/^([A-Z]{2,4}\d{3}[A-Z]?)/i);
    const courseCode = codeMatch ? codeMatch[1].toUpperCase() : null;

    if (!courseCode || seen.has(courseCode)) return;
    seen.add(courseCode);

    const courseTitle = h3Text.replace(/^[A-Z]{2,4}\d{3}[A-Z]?\s*-?\s*/i, '').trim() || courseCode;

    const activities: DashboardActivityPreview[] = [];

    const quizIndicator = card.find('[id*="ibtnQuizzes"]').first();
    const hasQuizzes = quizIndicator.length > 0;
    if (hasQuizzes) {
      activities.push({ type: 'quiz', courseCode, isPending: true });
    }

    const assignmentIndicator = card.find('[id*="ibtnAssignments"]').first();
    const hasAssignments = assignmentIndicator.length > 0;
    if (hasAssignments) {
      activities.push({ type: 'assignment', courseCode, isPending: true });
    }

    const gdbIndicator = card.find('[id*="ibtnGDB"]').first();
    const hasGDBs = gdbIndicator.length > 0;
    if (hasGDBs) {
      activities.push({ type: 'gdb', courseCode, isPending: true });
    }

    const lectureIndicator = card.find('[id*="ibtnActivitySession"]').first();
    const hasLectures = lectureIndicator.length > 0;
    if (hasLectures) {
      activities.push({ type: 'lecture', courseCode, isNew: true });
    }

    const upcomingCount = activities.filter(a => a.isUpcoming).length;
    const pendingCount = activities.filter(a => a.isPending).length;

    courses.push({
      courseCode,
      courseTitle,
      hasQuizzes,
      hasAssignments,
      hasGDBs,
      hasLectures,
      quizCount: hasQuizzes ? 1 : 0,
      assignmentCount: hasAssignments ? 1 : 0,
      gdbCount: hasGDBs ? 1 : 0,
      lectureCount: hasLectures ? 1 : 0,
      upcomingCount,
      pendingCount,
      activities,
    });

    log.debug(`parseDashboard: course=${courseCode} quizzes=${hasQuizzes} assignments=${hasAssignments} gdb=${hasGDBs} lectures=${hasLectures}`);
  });

  if (courses.length === 0) {
    log.debug('parseDashboard: no course cards found, trying fallback extraction');
    return parseDashboardFallback($, log);
  }

  log.info(`parseDashboard: ${courses.length} courses from dashboard`);
  return courses;
}

function parseDashboardFallback($: cheerio.CheerioAPI, _log: Logger): DashboardCourse[] {
  const courses: DashboardCourse[] = [];
  const seen = new Set<string>();

  $('[class*="m-portlet"]').each((_, el) => {
    const card = $(el);
    const h3 = card.find('h3').first();
    const h3Text = h3.text().trim();

    const code = extractCodeFromText(h3Text);
    if (!code || seen.has(code)) return;
    seen.add(code);

    const courseTitle = h3Text.replace(/^[A-Z]{2,4}\d{3}[A-Z]?\s*-?\s*/i, '').trim() || code;

    courses.push({
      courseCode: code,
      courseTitle,
      activities: [],
    });
  });

  return courses;
}