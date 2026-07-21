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
    subjects: {
      English: ['2082','2081'], Mathematics: ['2082','2081'], Nepali: ['2082','2081'],
      Science: ['2082','2081'], 'Social Studies': ['2082','2081'],
      'Computer Science': ['2082','2081'], Accounting: ['2082','2081'],
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
    Science:    { subjects: { English: ['2083','2082','2081'], Mathematics: ['2083','2082','2081'], Nepali: ['2083','2082','2081'], Physics: ['2083','2082','2081'], Chemistry: ['2083','2082','2081'], Biology: ['2083','2082','2081'], 'Computer Science': ['2083','2082','2081'] } },
    Management: { subjects: { English: ['2083','2082','2081'], Mathematics: ['2083','2082','2081'], Nepali: ['2083','2082','2081'], 'Social Studies': ['2083','2082','2081'], Economics: ['2083','2082','2081'], Accounting: ['2083','2082','2081'], 'Business Studies': ['2083','2082','2081'] } },
  } },
  12: { streams: {
    Science:    { subjects: { English: ['2083','2082','2081'], Mathematics: ['2083','2082','2081'], Nepali: ['2083','2082','2081'], Physics: ['2083','2082','2081'], Chemistry: ['2083','2082','2081'], Biology: ['2083','2082','2081'], 'Computer Science': ['2083','2082','2081'] } },
    Management: { subjects: { English: ['2083','2082','2081'], Mathematics: ['2083','2082','2081'], Nepali: ['2083','2082','2081'], 'Social Studies': ['2083','2082','2081'], Economics: ['2083','2082','2081'], Accounting: ['2083','2082','2081'], 'Business Studies': ['2083','2082','2081'] } },
  } },
};

export const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');

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