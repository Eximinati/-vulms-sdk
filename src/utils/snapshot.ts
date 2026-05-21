import * as fs from 'fs';
import * as path from 'path';

const SNAPSHOT_DIR = path.join(process.cwd(), 'debug');

const CATEGORIES = ['assignments', 'quizzes', 'gdb', 'lectures', 'activities', 'courses', 'misc'] as const;
type Category = typeof CATEGORIES[number];

export interface SnapshotOptions {
  category: Category | string;
  prefix?: string;
  label?: string;
}

export function saveHtmlSnapshot(html: string, options: SnapshotOptions): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const category = options.category || 'misc';
  const prefix = options.prefix ? `${options.prefix}-` : '';
  const label = options.label ? `-${options.label}` : '';
  const filename = `${prefix}${timestamp}${label}.html`;

  const categoryDir = path.join(SNAPSHOT_DIR, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  const filepath = path.join(categoryDir, filename);
  fs.writeFileSync(filepath, html, 'utf-8');
  return filepath;
}

export function saveTextSnapshot(text: string, options: Omit<SnapshotOptions, 'category'> & { category?: string }): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const category = options.category || 'misc';
  const prefix = options.prefix ? `${options.prefix}-` : '';
  const filename = `${prefix}${timestamp}.txt`;

  const categoryDir = path.join(SNAPSHOT_DIR, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  const filepath = path.join(categoryDir, filename);
  fs.writeFileSync(filepath, text, 'utf-8');
  return filepath;
}

export function listSnapshots(category?: string): string[] {
  if (category) {
    const dir = path.join(SNAPSHOT_DIR, category);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(f => f.endsWith('.html') || f.endsWith('.txt'));
  }

  const results: string[] = [];
  for (const cat of CATEGORIES) {
    const dir = path.join(SNAPSHOT_DIR, cat);
    if (fs.existsSync(dir)) {
      results.push(...fs.readdirSync(dir).map(f => `${cat}/${f}`));
    }
  }
  return results;
}

export function loadSnapshot(filepath: string): string {
  return fs.readFileSync(filepath, 'utf-8');
}

export function clearSnapshots(category?: string): void {
  if (category) {
    const dir = path.join(SNAPSHOT_DIR, category);
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir)) {
        fs.unlinkSync(path.join(dir, f));
      }
    }
  } else {
    for (const cat of CATEGORIES) {
      const dir = path.join(SNAPSHOT_DIR, cat);
      if (fs.existsSync(dir)) {
        for (const f of fs.readdirSync(dir)) {
          fs.unlinkSync(path.join(dir, f));
        }
      }
    }
  }
}

export function getSnapshotStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    const dir = path.join(SNAPSHOT_DIR, cat);
    if (fs.existsSync(dir)) {
      stats[cat] = fs.readdirSync(dir).filter(f => f.endsWith('.html') || f.endsWith('.txt')).length;
    } else {
      stats[cat] = 0;
    }
  }
  return stats;
}

export { SNAPSHOT_DIR, CATEGORIES };
export type { Category };