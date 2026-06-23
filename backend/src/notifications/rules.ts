import type { ActivityDto } from '../types/activities.js';
import type { NotificationCandidate, NotificationType } from './types.js';

function generateId(type: NotificationType, activity: ActivityDto): string {
  return `${type}:${activity.courseCode}:${activity.id}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'unknown date';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function checkAssignmentRules(activity: ActivityDto): NotificationCandidate | null {
  if (activity.type !== 'assignment') return null;

  if (activity.status === 'pending') {
    const type: NotificationType = 'assignment_due';
    return {
      id: generateId(type, activity),
      type,
      activityId: activity.id,
      courseCode: activity.courseCode,
      title: activity.title,
      message: `Assignment "${activity.title}" for ${activity.courseCode} is due on ${formatDate(activity.dueDate)}`,
      createdAt: new Date().toISOString(),
    };
  }

  return null;
}

export function checkQuizRules(activity: ActivityDto): NotificationCandidate | null {
  if (activity.type !== 'quiz') return null;

  if (activity.status === 'open' || activity.status === 'pending') {
    const type: NotificationType = activity.status === 'open' ? 'quiz_open' : 'quiz_upcoming';
    const message = type === 'quiz_open'
      ? `Quiz "${activity.title}" for ${activity.courseCode} is now open`
      : `Quiz "${activity.title}" for ${activity.courseCode} is upcoming`;

    return {
      id: generateId(type, activity),
      type,
      activityId: activity.id,
      courseCode: activity.courseCode,
      title: activity.title,
      message,
      createdAt: new Date().toISOString(),
    };
  }

  return null;
}

export function checkGdbRules(activity: ActivityDto): NotificationCandidate | null {
  if (activity.type !== 'gdb') return null;

  if (activity.status === 'pending') {
    const type: NotificationType = 'gdb_due';
    return {
      id: generateId(type, activity),
      type,
      activityId: activity.id,
      courseCode: activity.courseCode,
      title: activity.title,
      message: `GDB "${activity.title}" for ${activity.courseCode} is due on ${formatDate(activity.dueDate)}`,
      createdAt: new Date().toISOString(),
    };
  }

  return null;
}

export function checkResultRules(activity: ActivityDto): NotificationCandidate | null {
  if (activity.status === 'result_declared') {
    const type: NotificationType = 'result_declared';
    return {
      id: generateId(type, activity),
      type,
      activityId: activity.id,
      courseCode: activity.courseCode,
      title: activity.title,
      message: `Result declared for "${activity.title}" in ${activity.courseCode}`,
      createdAt: new Date().toISOString(),
    };
  }

  return null;
}

export const allRules = [
  checkAssignmentRules,
  checkQuizRules,
  checkGdbRules,
  checkResultRules,
];
