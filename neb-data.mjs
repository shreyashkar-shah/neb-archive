/* ============================================================
 NEB Archive — Single Source of Truth (data + path helpers)
 ------------------------------------------------------------
 One place for paper metadata.
 • generate-pages.mjs imports this at BUILD time.
 • pyqs.js can import it at RUNTIME too: switch pyqs.html to
     <script type="module" src="JS/pyqs.js"></script>
   then add at the top of pyqs.js:
     import { BOARD_DATA, SCHOOL_DATA, PROVINCES,
              getPaperPath, getPaperURL } from '../neb-data.mjs';
   ...and delete the inline copies. Add a paper once → UI + SEO update together.
 ============================================================ */

export const SUPABASE_URL   = 'https://cqmqxazynzmkoahuppnu.supabase.co';
export const STORAGE_BUCKET = 'pyqs';

export const PROVINCES = ['Koshi','Madhesh','Bagmati','Gandaki','Lumbini','Karnali','Sudurpashchim'];

export const BOARD_DATA = {
  10: {
    province: true,
    // Each province has its OWN subject → years map.
    // They all start identical (same as before this change) so nothing on
    // the site changes yet. Edit each province's lists independently as you
    // confirm what papers actually exist for it — remove a year that isn't
    // available, or leave a subject as [] if that province has none yet.
    subjects: {
      Koshi: {
        English: ['2082','2081','2080'],
        Mathematics: ['2082','2081','2080'],
        Nepali: ['2082','2081','2080'],
        Science: ['2082','2081','2080'],
        'Social Studies': ['2082','2081','2080'],
        'Computer Science': ['2082','2081','2080'],
        Accounting: ['2082','2081','2080'],
      },
      Madhesh: {
        English: ['2082','2081','2080'],
        Mathematics: ['2082','2081','2080'],
        Nepali: ['2082','2081','2080'],
        Science: ['2082','2081','2080'],
        'Social Studies': ['2082','2081','2080'],
        'Computer Science': ['2082','2081','2080'],
        Accounting: ['2082','2081','2080'],
      },
      Bagmati: {
        English: ['2082','2081','2080'],
        Mathematics: ['2082','2081','2080'],
        Nepali: ['2082','2081','2080'],
        Science: ['2082','2081','2080'],
        'Social Studies': ['2082','2081','2080'],
        'Computer Science': ['2082','2081','2080'],
        Accounting: ['2082','2081','2080'],
      },
      Gandaki: {
        English: ['2082','2081','2080'],
        Mathematics: ['2082','2081','2080'],
        Nepali: ['2082','2081','2080'],
        Science: ['2082','2081','2080'],
        'Social Studies': ['2082','2081','2080'],
        'Computer Science': ['2082','2081','2080'],
        Accounting: ['2082','2081','2080'],
      },
      Lumbini: {
        English: ['2082','2081','2080'],
        Mathematics: ['2082','2081','2080'],
        Nepali: ['2082','2081','2080'],
        Science: ['2082','2081','2080'],
        'Social Studies': ['2082','2081','2080'],
        'Computer Science': ['2082','2081','2080'],
        Accounting: ['2082','2081','2080'],
      },
      Karnali: {
        English: ['2082','2081','2080'],
        Mathematics: ['2082','2081','2080'],
        Nepali: ['2082','2081','2080'],
        Science: ['2082','2081','2080'],
        'Social Studies': ['2082','2081','2080'],
        'Computer Science': ['2082','2081','2080'],
        Accounting: ['2082','2081','2080'],
      },
      Sudurpashchim: {
        English: ['2082','2081','2080'],
        Mathematics: ['2082','2081','2080'],
        Nepali: ['2082','2081','2080'],
        Science: ['2082','2081','2080'],
        'Social Studies': ['2082','2081','2080'],
        'Computer Science': ['2082','2081','2080'],
        Accounting: ['2082','2081','2080'],
      },
    },
  },
  11: {
    streams: {
      Science:    { subjects: { English: [], Mathematics: [], Nepali: [], Physics: [], Chemistry: [], Biology: [], 'Computer Science': [] } },
      Management: { subjects: { English: [], Mathematics: [], Nepali: [], 'Social Studies': [], Economics: [], Accounting: [], 'Business Studies': [] } },
    },
  },
  12: {
    streams: {
      Science: { subjects: {
        English: ['2083','2082','2081','2080'],
        Mathematics: ['2083','2082','2081','2080'],
        Nepali: ['2083','2082','2081','2080'],
        Physics: ['2083','2082','2081','2080', { value:'2079-Model', label:'2079' }, { value:'2078-Model', label:'2078' }],
        Chemistry: ['2083','2082','2081', { value:'2081-Supplementary', label:'2081' }, { value:'2080-GIE', label:'2080' }],
        Biology: ['2083','2082','2081'],
        'Computer Science': ['2083','2082','2081','2080'],
      } },
      Management: { subjects: {
        English: ['2083','2082','2081','2080'],
        Mathematics: ['2083','2082','2081','2080'],
        Nepali: ['2083','2082','2081','2080'],
        'Social Studies': [], Economics: [],
        Accounting: ['2083'], 'Business Studies': [],
      } },
    },
  },
};

export const SCHOOL_DATA = {
  11: { streams: {
    Science:    { subjects: { English: [], Mathematics: [], Nepali: [], Physics: [], Chemistry: [], Biology: [], 'Computer Science': [] } },
    Management: { subjects: { English: [], Mathematics: [], Nepali: [], 'Social Studies': [], Economics: [], Accounting: [], 'Business Studies': [] } },
  } },
  12: { streams: {
    Science:    { subjects: { English: [], Mathematics: [], Nepali: [], Physics: [], Chemistry: [], Biology: [], 'Computer Science': [] } },
    Management: { subjects: { English: [], Mathematics: [], Nepali: [], 'Social Studies': [], Economics: [], Accounting: [], 'Business Studies': [] } },
  } },
};

export const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');

// Single source of truth for "what years exist for this subject" — mirrors
// the streams/province/flat shapes above. Used by pyqs.js to render the
// list, and by viewer.js to know what the "next"/"previous" paper is.
export function getSubjectYears(source, grade, stream, subject, province) {
  const node = source === 'board' ? BOARD_DATA[grade] : SCHOOL_DATA[grade];
  if (!node) return [];
  const subjects = node.streams  ? (node.streams[stream]?.subjects || {})
                  : node.province ? (node.subjects?.[province] || {})
                  : (node.subjects || {});
  return subjects[subject] || [];
}

// Same, but normalized to plain path-usable strings (unwraps {value,label}).
export function getSubjectYearValues(source, grade, stream, subject, province) {
  return getSubjectYears(source, grade, stream, subject, province).map(y => y.value || y);
}

export function getPaperPath(source, grade, stream, subject, year, mode, province) {
  const suffix = mode === 'solution' ? '-solution' : '';
  const file = `${year}${suffix}.pdf`;
  if (source === 'board') {
    if (['11','12'].includes(String(grade))) return `board/${grade}/${slug(stream)}/${slug(subject)}/${file}`;
    return `board/${grade}/${slug(province)}/${slug(subject)}/${file}`;
  }
  return `school/${grade}/${slug(stream)}/${slug(subject)}/${file}`;
}

export const getPaperURL = (path) => `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;