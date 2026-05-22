import type { Course } from '../types/course';

export interface CachedValue<T> {
  value: T;
  createdAt: number;
}

export interface DashboardIndicators {
  assignments: Set<string>;
  quizzes: Set<string>;
  gdbs: Set<string>;
  lectures: Set<string>;
}

export interface RuntimeState {
  loggedIn: boolean;
  username?: string;

  dashboardHtml?: string;
  dashboardCachedAt?: number;

  courses?: Course[];
  coursesCachedAt?: number;

  dashboardIndicators?: DashboardIndicators;

  cache: {
    assignments?: CachedValue<unknown>;
    quizzes?: CachedValue<unknown>;
    gdbs?: CachedValue<unknown>;
    lectures?: CachedValue<unknown>;
    activities?: CachedValue<unknown>;
    courses?: CachedValue<Course[]>;
  };

  cookies?: string;

  telemetry: {
    cacheHits: number;
    cacheMisses: number;
    skippedTraversals: number;
    requestsSaved: number;
  };

  createdAt: number;
}

export const CACHE_TTL_MS = 5 * 60 * 1000;

export function createRuntimeState(): RuntimeState {
  return {
    loggedIn: false,
    cache: {},
    telemetry: {
      cacheHits: 0,
      cacheMisses: 0,
      skippedTraversals: 0,
      requestsSaved: 0,
    },
    createdAt: Date.now(),
  };
}

export function isCacheValid<T>(entry: CachedValue<T> | undefined, ttlMs: number = CACHE_TTL_MS): entry is CachedValue<T> {
  if (!entry) return false;
  return Date.now() - entry.createdAt < ttlMs;
}

export function setCache<T>(state: RuntimeState, key: keyof RuntimeState['cache'], value: T): void {
  (state.cache as Record<string, CachedValue<unknown> | undefined>)[key] = { value, createdAt: Date.now() };
}

export function getCache<T>(state: RuntimeState, key: keyof RuntimeState['cache'], ttlMs: number = CACHE_TTL_MS): T | null {
  const entry = state.cache[key];
  if (isCacheValid(entry, ttlMs)) {
    state.telemetry.cacheHits++;
    return JSON.parse(JSON.stringify(entry.value)) as T;
  }
  if (entry) {
    state.telemetry.cacheMisses++;
    delete state.cache[key];
  } else {
    state.telemetry.cacheMisses++;
  }
  return null;
}

export function invalidateCache(state: RuntimeState, key?: keyof RuntimeState['cache']): void {
  if (key) {
    delete state.cache[key];
  } else {
    state.cache = {};
  }
}

export function extractDashboardIndicators(html: string): DashboardIndicators {
  const indicators: DashboardIndicators = {
    assignments: new Set(),
    quizzes: new Set(),
    gdbs: new Set(),
    lectures: new Set(),
  };

  const courseCodePattern = /<h3[^>]*>\s*([A-Z]{2,4}\d{3}[A-Z]?)\s*[-–]/gi;

  const courseCodes: string[] = [];
  let codeMatch;
  while ((codeMatch = courseCodePattern.exec(html)) !== null) {
    courseCodes.push(codeMatch[1].toUpperCase());
  }

  const assignmentPattern = /MainContent_gvCourseList_ibtnAssignments_(\d+)/g;
  const quizPattern = /MainContent_gvCourseList_ibtnQuizzes_(\d+)/g;
  const gdbPattern = /MainContent_gvCourseList_ibtnGDB_(\d+)/g;
  const lecturePattern = /MainContent_gvCourseList_ibtnActivitySession_(\d+)/g;

  const findCoursesWithButton = (pattern: RegExp): Set<string> => {
    const result = new Set<string>();
    let m;
    while ((m = pattern.exec(html)) !== null) {
      const idx = parseInt(m[1]);
      if (courseCodes[idx]) {
        result.add(courseCodes[idx]);
      }
    }
    return result;
  };

  indicators.assignments = findCoursesWithButton(assignmentPattern);
  indicators.quizzes = findCoursesWithButton(quizPattern);
  indicators.gdbs = findCoursesWithButton(gdbPattern);
  indicators.lectures = findCoursesWithButton(lecturePattern);

  return indicators;
}
