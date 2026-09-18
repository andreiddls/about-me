// Generates public/Andrei_Tolstykh_CV.pdf from data/cv-full.json.
//
// Written by hand (no dependencies) so the PDF stays in sync with the website
// and llms.txt: every fact comes from the same JSON. Uses the base-14 Helvetica
// fonts with WinAnsi encoding, so no font file has to be embedded.
//
// Run with: npm run cv:pdf

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.join(__dirname, '..');
const cv = JSON.parse(fs.readFileSync(path.join(root, 'data/cv-full.json'), 'utf8'));

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_X = 48;
const MARGIN_TOP = 52;
const MARGIN_BOTTOM = 46;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

// Deliberately generous per-character widths (in 1/1000 em). Overestimating
// means a line wraps slightly early - never past the right margin.
const WIDE = new Set(['W', 'M', 'm', 'w', '@', '%']);
const NARROW = new Set([' ', 'i', 'l', 'j', 't', 'f', 'I', 'r', '.', ',', ':', ';', "'", '!', '|', '(', ')', '-', '/']);

function charWidth(ch, bold) {
  let w;
  if (WIDE.has(ch)) w = 900;
  else if (NARROW.has(ch)) w = 320;
  else if (ch >= 'A' && ch <= 'Z') w = 720;
  else w = 570;
  return bold ? w + 30 : w;
}

function textWidth(text, size, bold) {
  let total = 0;
  for (const ch of text) total += charWidth(ch, bold);
  return (total / 1000) * size;
}

function wrap(text, size, bold, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (textWidth(candidate, size, bold) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// WinAnsi (cp1252) bytes for the few non-latin1 characters we actually use.
const WINANSI = { '—': 0x97, '–': 0x96, '•': 0x95, '’': 0x92, '‘': 0x91, '“': 0x93, '”': 0x94, '…': 0x85 };

function pdfString(text) {
  const bytes = [];
  for (const ch of String(text)) {
    let code = WINANSI[ch];
    if (code === undefined) {
      code = ch.codePointAt(0);
      if (code > 0xff) code = 0x3f; // '?' for anything outside WinAnsi
    }
    if (code === 0x28 || code === 0x29 || code === 0x5c) bytes.push(0x5c); // escape ( ) \
    bytes.push(code);
  }
  return Buffer.from(bytes).toString('latin1');
}

// ── Layout ───────────────────────────────────────────────────────────

const pages = [];
let ops = [];
let y = PAGE_H - MARGIN_TOP;

function newPage() {
  if (ops.length) pages.push(ops);
  ops = [];
  y = PAGE_H - MARGIN_TOP;
}

function space(amount) {
  y -= amount;
  if (y < MARGIN_BOTTOM) newPage();
}

function draw(text, { size = 9.5, bold = false, gray = 0, x = MARGIN_X, leading = 12.5, width = CONTENT_W } = {}) {
  for (const line of wrap(text, size, bold, width)) {
    if (y < MARGIN_BOTTOM) newPage();
    ops.push(
      'BT',
      `/${bold ? 'F2' : 'F1'} ${size} Tf`,
      `${gray} g`,
      `1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`,
      `(${pdfString(line)}) Tj`,
      'ET'
    );
    y -= leading;
  }
}

function bullet(text) {
  const indent = 10;
  const lines = wrap(text, 9, false, CONTENT_W - indent);
  lines.forEach((line, i) => {
    if (y < MARGIN_BOTTOM) newPage();
    ops.push(
      'BT',
      '/F1 9 Tf',
      '0.25 g',
      `1 0 0 1 ${(MARGIN_X + (i === 0 ? 0 : indent)).toFixed(2)} ${y.toFixed(2)} Tm`,
      `(${pdfString(i === 0 ? `• ${line}` : line)}) Tj`,
      'ET'
    );
    y -= 11.5;
  });
}

function sectionTitle(title) {
  space(8);
  draw(title.toUpperCase(), { size: 9, bold: true, gray: 0.35, leading: 6 });
  ops.push(`0.8 g`, `${MARGIN_X} ${y.toFixed(2)} m ${(PAGE_W - MARGIN_X).toFixed(2)} ${y.toFixed(2)} l S`);
  space(12);
}

const m = cv.meta;
draw(m.name, { size: 20, bold: true, leading: 24 });
draw(m.title, { size: 11, gray: 0.3, leading: 16 });
draw(`${m.location}   |   ${m.email}   |   ${m.phone}   |   ${m.site.replace(/^https:\/\//, '')}`, { size: 8.5, gray: 0.4, leading: 12 });
draw(`Work authorization: ${cv.availability.workAuthorization}`, { size: 8.5, gray: 0.4, leading: 12 });

sectionTitle('Profile');
draw(cv.summary, { size: 9, gray: 0.2, leading: 11.5 });

sectionTitle('Experience');
cv.experience.forEach((job, i) => {
  if (i) space(6);
  draw(job.role, { size: 10.5, bold: true, leading: 13 });
  draw(`${job.company} (${job.location})   |   ${job.period}`, { size: 8.5, gray: 0.4, leading: 12 });
  job.bullets.forEach(bullet);
});

sectionTitle('Skills & Toolkit');
cv.skills.forEach((group) => {
  draw(`${group.group}:`, { size: 9, bold: true, leading: 11.5 });
  draw(group.items, { size: 9, gray: 0.2, leading: 11.5 });
  space(4);
});

sectionTitle('Education');
cv.education.forEach((e) => {
  draw(e.degree, { size: 9, bold: true, leading: 11 });
  draw(`${e.school}   |   ${e.year}`, { size: 8.5, gray: 0.4, leading: 12 });
});

sectionTitle('Certifications');
cv.certifications.forEach((c) => draw(`${c.name}   |   ${c.year}`, { size: 9, gray: 0.2, leading: 11.5 }));

sectionTitle('Languages');
draw(cv.languages.map((l) => `${l.name}: ${l.level}`).join('   |   '), { size: 9, gray: 0.2, leading: 11.5 });

newPage();

// ── PDF assembly ─────────────────────────────────────────────────────

const objects = [];
function addObject(body) {
  objects.push(body);
  return objects.length; // 1-based object number
}

const fontRegular = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
const fontBold = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
const pagesId = addObject(null); // reserved, filled in below

const pageIds = [];
const contentIds = [];
pages.forEach((pageOps) => {
  const stream = zlib.deflateSync(Buffer.from(pageOps.join('\n'), 'latin1'));
  const contentId = addObject({ dict: `<< /Length ${stream.length} /Filter /FlateDecode >>`, stream });
  contentIds.push(contentId);
  pageIds.push(addObject(
    `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
    `/Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${contentId} 0 R >>`
  ));
});

objects[pagesId - 1] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`;

const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
const now = new Date();
const stamp = `D:${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}000000Z`;
const infoId = addObject(
  `<< /Title (${pdfString(`${m.name} - ${m.title} - CV`)}) /Author (${pdfString(m.name)}) ` +
  `/Subject (${pdfString(`Curriculum Vitae - ${m.title}`)}) ` +
  `/Keywords (${pdfString('Product Design, UX Strategy, Design Systems, Design Engineering, Enterprise B2B, AI Governance, Figma, Storybook, React')}) ` +
  `/Creator (${pdfString(m.site)}) /CreationDate (${stamp}) /ModDate (${stamp}) >>`
);

const chunks = [];
let offset = 0;
function push(str) {
  const buf = Buffer.isBuffer(str) ? str : Buffer.from(str, 'latin1');
  chunks.push(buf);
  offset += buf.length;
}

push('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n');
const offsets = [];
objects.forEach((body, i) => {
  offsets[i] = offset;
  if (body && body.stream) {
    push(`${i + 1} 0 obj\n${body.dict}\nstream\n`);
    push(body.stream);
    push('\nendstream\nendobj\n');
  } else {
    push(`${i + 1} 0 obj\n${body}\nendobj\n`);
  }
});

const xrefOffset = offset;
let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
offsets.forEach((off) => {
  xref += `${String(off).padStart(10, '0')} 00000 n \n`;
});
push(xref);
push(`trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

const out = path.join(root, 'public/Andrei_Tolstykh_CV.pdf');
fs.writeFileSync(out, Buffer.concat(chunks));
console.log(`Generated public/Andrei_Tolstykh_CV.pdf (${pages.length} page(s), ${Buffer.concat(chunks).length} bytes)`);
