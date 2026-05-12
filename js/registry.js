// Pocket Tools — single source of truth for all tools.
// Each entry: { id, name, category, description, icon (inline SVG path d), needsPdfLib?, needsPdfJs? }
// Categories: photos, documents, text, math, time, utilities

export const CATEGORIES = [
  { id: 'photos',    label: 'Photos' },
  { id: 'documents', label: 'Documents' },
  { id: 'text',      label: 'Text' },
  { id: 'math',      label: 'Money & Math' },
  { id: 'time',      label: 'Time' },
  { id: 'utilities', label: 'Utilities' },
];

// Simple inline SVG path strokes. 24×24 viewBox, stroke="currentColor".
const ICONS = {
  image:    'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zM3 17l5-5 4 4 3-3 6 6 M9 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0',
  swap:     'M7 7h13l-3-3 M17 17H4l3 3',
  rename:   'M4 7h9 M4 12h7 M4 17h5 M15 5l4 4-8 8H7v-4z',
  resize:   'M3 8V3h5 M21 8V3h-5 M3 16v5h5 M21 16v5h-5',
  crop:     'M6 2v16a2 2 0 0 0 2 2h14 M22 18H6 a2 2 0 0 1-2-2V2',
  filePdf:  'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
  drop:     'M12 2l5 5a7 7 0 1 1-10 0z',
  watermark:'M3 3h18v18H3z M7 8h10 M7 12h10 M7 16h6',
  sun:      'M12 4V2 M12 22v-2 M4 12H2 M22 12h-2 M5 5l-1-1 M20 20l-1-1 M5 19l-1 1 M20 4l-1 1 M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
  merge:    'M8 3v5a4 4 0 0 0 4 4h0a4 4 0 0 1 4 4v5 M16 3v5a4 4 0 0 1-4 4 M4 12h16',
  split:    'M16 3l4 4-4 4 M20 7H4 M8 13l-4 4 4 4 M4 17h16',
  lock:     'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',
  hash:     'M4 9h16 M4 15h16 M10 3L8 21 M16 3l-2 18',
  unlock:   'M5 11h14v10H5z M8 11V7a4 4 0 0 1 7-2',
  shield:   'M12 2l8 4v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6z M9 12h6',
  pen:      'M4 20h16 M5 16l10-10 3 3L8 19H5z',
  cart:     'M4 5h2l2 10h9l3-7H7 M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  rotate:   'M3 12a9 9 0 1 0 3-6.7 M3 4v5h5',
  type:     'M4 7V4h16v3 M9 20h6 M12 4v16',
  case:     'M3 18l5-12 5 12 M5 14h6 M14 18V8h4a3 3 0 0 1 0 6h-4',
  trim:     'M5 8l14 0 M5 12l14 0 M5 16l14 0',
  sort:     'M3 6h18 M3 12h12 M3 18h6',
  dedupe:   'M9 3h12v12H9z M3 9h12v12H3z',
  read:     'M2 5h9a3 3 0 0 1 3 3v13 a3 3 0 0 0-3-3H2zM22 5h-9a3 3 0 0 0-3 3v13 a3 3 0 0 1 3-3h9z',
  split2:   'M5 3v6h6 M5 9l6-6 M19 21v-6h-6 M19 15l-6 6',
  percent:  'M19 5L5 19 M6.5 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z M20.5 17a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z',
  emi:      'M3 21V7l9-4 9 4v14 M9 21V11h6v10',
  delta:    'M12 4l9 16H3z',
  ruler:    'M2 12L12 2l10 10-10 10z M7 12h2 M11 12h2 M15 12h2',
  timer:    'M12 7v5l3 3 M12 22a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9 2h6',
  cal:      'M4 5h16v16H4z M4 9h16 M9 3v4 M15 3v4',
  globe:    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a14 14 0 0 1 0 20 M12 2a14 14 0 0 0 0 20',
  watch:    'M9 4h6l1 4 M9 20h6l1-4 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  key:      'M21 2l-9.6 9.6a5 5 0 1 1-2 2L3 22 M16 7l3 3',
  qr:       'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h3v3h-3z M20 14v3 M14 20h3 M20 20v1',
  dice:     'M5 3h14v14H5z M9 7l0 0 M15 7l0 0 M9 13l0 0 M15 13l0 0 M12 10l0 0',
  contrast: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 2v20',
};

export const TOOLS = [
  // PHOTOS
  { id: 'image-compressor',  name: 'Image Compressor + Converter', category: 'photos', desc: 'Batch resize, compress, convert', icon: ICONS.image },
  { id: 'format-converter',  name: 'Image Format Converter', category: 'photos',  desc: 'Batch convert PNG, JPG, WebP, AVIF',       icon: ICONS.swap },
  { id: 'bulk-renamer',      name: 'Bulk Photo Renamer', category: 'photos',       desc: 'Rename photos into a ZIP',           icon: ICONS.rename },
  { id: 'social-resizer',    name: 'Social Media Resizer', category: 'photos',    desc: 'Instagram, YouTube, etc.',           icon: ICONS.resize },
  { id: 'ratio-cropper',     name: 'Aspect Ratio Cropper', category: 'photos',    desc: '1:1, 4:5, 16:9, custom',             icon: ICONS.crop },
  { id: 'photo-pdf',         name: 'Photo → PDF',          category: 'photos',    desc: 'Combine photos into one PDF',        icon: ICONS.filePdf, needsPdfLib: true },
  { id: 'color-picker',      name: 'Image Color Picker',   category: 'photos',    desc: 'Pick HEX/RGB from a photo',          icon: ICONS.drop },
  { id: 'watermark',         name: 'Text Watermark',       category: 'photos',    desc: 'Add a text watermark',               icon: ICONS.watermark },
  { id: 'black-and-white',   name: 'Black & White',        category: 'photos',    desc: 'Convert image to grayscale',         icon: ICONS.sun },

  // DOCUMENTS (8 — bonus rotate-pdf, unprotect-pdf, receipt-enhancer)
  { id: 'merge-pdf',         name: 'Merge PDF',            category: 'documents', desc: 'Combine multiple PDFs',              icon: ICONS.merge,  needsPdfLib: true },
  { id: 'split-pdf',         name: 'Split PDF',            category: 'documents', desc: 'Split into separate pages',          icon: ICONS.split,  needsPdfLib: true },
  { id: 'protect-pdf',       name: 'Password Protect PDF', category: 'documents', desc: 'Encrypt and download a PDF',          icon: ICONS.lock,   needsPdfLib: true },
  { id: 'page-numbers',      name: 'PDF Page Numberer',    category: 'documents', desc: 'Add page numbers',                   icon: ICONS.hash,   needsPdfLib: true },
  { id: 'extract-pdf',       name: 'Extract PDF Text',     category: 'documents', desc: 'Pull all text out of a PDF',         icon: ICONS.read,   needsPdfJs: true },
  { id: 'rotate-pdf',        name: 'Rotate PDF',           category: 'documents', desc: 'Rotate pages 90°/180°/270°',         icon: ICONS.rotate, needsPdfLib: true },
  { id: 'unprotect-pdf',     name: 'Unprotect PDF',        category: 'documents', desc: 'Remove a known password',            icon: ICONS.unlock, needsPdfLib: true },
  { id: 'id-masker',         name: 'ID Masker',            category: 'documents', desc: 'Mask sensitive ID details',          icon: ICONS.shield, needsPdfJs: true },
  { id: 'receipt-enhancer',  name: 'Receipt Enhancer',     category: 'documents', desc: 'B/W + contrast for receipts',        icon: ICONS.contrast },

  // TEXT (6)
  { id: 'word-counter',      name: 'Word & Char Counter',  category: 'text',      desc: 'Live count of words & chars',        icon: ICONS.type },
  { id: 'case-converter',    name: 'Case Converter',       category: 'text',      desc: 'UPPER, lower, Title, etc.',          icon: ICONS.case },
  { id: 'whitespace-remover',name: 'Whitespace Remover',   category: 'text',      desc: 'Trim extra spaces & breaks',         icon: ICONS.trim },
  { id: 'alphabetical-sorter',name:'Alphabetical Sorter',  category: 'text',      desc: 'Sort lines A→Z',                     icon: ICONS.sort },
  { id: 'duplicate-remover', name: 'Duplicate Remover',    category: 'text',      desc: 'Remove duplicate lines',             icon: ICONS.dedupe },
  { id: 'reading-time',      name: 'Reading Time',         category: 'text',      desc: 'Estimate read & speak time',         icon: ICONS.read },

  // MATH (5)
  { id: 'bill-splitter',     name: 'Bill Splitter',        category: 'math',      desc: 'Equal, shares, percent, amount',             icon: ICONS.split2 },
  { id: 'discount-calculator',name:'Discount Calculator',  category: 'math',      desc: 'Final price after discount',         icon: ICONS.percent },
  { id: 'emi-calculator',    name: 'EMI Calculator',       category: 'math',      desc: 'Monthly loan EMI',                   icon: ICONS.emi },
  { id: 'percentage-change', name: 'Percentage Change',    category: 'math',      desc: 'Increase / decrease %',              icon: ICONS.delta },
  { id: 'unit-converter',    name: 'Unit Converter',       category: 'math',      desc: 'Length, weight, temperature',        icon: ICONS.ruler },
  { id: 'grocery-calculator',name: 'Grocery Calculator',    category: 'math',      desc: 'List items and total prices',        icon: ICONS.cart },

  // TIME (4)
  { id: 'pomodoro',          name: 'Pomodoro Timer',       category: 'time',      desc: 'Custom focus and break timer',                   icon: ICONS.timer },
  { id: 'days-between',      name: 'Days Between Dates',   category: 'time',      desc: 'Days between two dates',             icon: ICONS.cal },
  { id: 'timezone',          name: 'Timezone Matcher',     category: 'time',      desc: 'Compare timezones',                  icon: ICONS.globe },
  { id: 'stopwatch',         name: 'Stopwatch',            category: 'time',      desc: 'Lap stopwatch',                      icon: ICONS.watch },

  // UTILITIES (3)
  { id: 'password-generator',name: 'Password Generator',   category: 'utilities', desc: 'Strong random passwords',            icon: ICONS.key },
  { id: 'qr-generator',      name: 'QR Code Generator',    category: 'utilities', desc: 'Make a QR code',                     icon: ICONS.qr },
  { id: 'random-decision',   name: 'Random Decision',      category: 'utilities', desc: 'Pick one from a list',               icon: ICONS.dice },
  { id: 'signature-png',     name: 'Signature to PNG',      category: 'utilities', desc: 'Draw transparent signature',         icon: ICONS.pen },
];

const TOOL_MAP = new Map(TOOLS.map(t => [t.id, t]));
export const getTool = (id) => TOOL_MAP.get(id);
export const isValidToolId = (id) => TOOL_MAP.has(id);
