#!/usr/bin/env node
/*
 * AEO Playbook builder — generic, data-driven.
 *
 * Usage:  node build_playbook.js <data.json> [output.docx]
 *
 * Reads a JSON file with { meta, body } and renders the "Winning the AI Answer Layer"
 * playbook as a styled .docx. The builder is content-agnostic: it just renders the ordered
 * `body` array of typed blocks. See data.example.json for the schema and a full example that
 * reproduces the standard outline. No customer data lives in this file — supply it all in data.json.
 *
 * Requires: npm install docx
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, PageNumber, PageBreak, ExternalHyperlink
} = require("docx");

// ---- theme (override via meta.theme) ----
const dataPath = process.argv[2];
if (!dataPath) { console.error("Usage: node build_playbook.js <data.json> [output.docx]"); process.exit(1); }
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const meta = data.meta || {};
const T = Object.assign({
  accent: "5B2A86", accent2: "8254B0", dark: "222222", grey: "666666",
  light: "F2EEF7", head: "5B2A86", good: "E3F1E6", warn: "FBE9E7", src: "EEF3F7"
}, meta.theme || {});

const CONTENT_W = 9360; // US Letter, 1" margins
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function cell(text, opts = {}) {
  const { w, fill, bold = false, color = T.dark, align = AlignmentType.LEFT, size = 17, runs } = opts;
  return new TableCell({
    borders, width: { size: w, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ alignment: align, children: runs || [new TextRun({ text: String(text == null ? "" : text), bold, color, size })] })]
  });
}
function colWidths(n, given) {
  if (given && given.length === n) {
    const sum = given.reduce((a, b) => a + b, 0);
    return given.map(w => Math.round(w * CONTENT_W / sum)); // normalize to content width
  }
  const base = Math.floor(CONTENT_W / n);
  const w = Array(n).fill(base); w[n - 1] += CONTENT_W - base * n; return w;
}
function renderTable(t) {
  const cols = t.cols || [];
  const widths = colWidths(cols.length, t.widths);
  const head = new TableRow({ tableHeader: true, children: cols.map((cc, i) =>
    cell(cc, { w: widths[i], fill: T.head, bold: true, color: "FFFFFF" })) });
  const rows = (t.rows || []).map((r, i) => new TableRow({ children: r.map((cv, j) => {
    let fill = i % 2 === 0 ? "FFFFFF" : T.light;
    if (t.highlightLastCol && j === cols.length - 1) fill = T.good;
    if (t.highlightFirstRow && i === 0) fill = T.good;
    return cell(cv, { w: widths[j], bold: j === 0, fill });
  }) }));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, rows: [head, ...rows] });
}
function renderSources(items, title) {
  const runs = [new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: title || "Sources", bold: true, size: 16, color: T.accent })] })];
  (items || []).forEach(it => {
    const [label, url] = Array.isArray(it) ? it : [it, null];
    runs.push(new Paragraph({ spacing: { after: 18 }, children: url
      ? [new TextRun({ text: "• ", size: 15, color: T.grey }), new ExternalHyperlink({ children: [new TextRun({ text: label, style: "Hyperlink", size: 15 })], link: url })]
      : [new TextRun({ text: "• " + label, size: 15, color: T.grey })] }));
  });
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    rows: [new TableRow({ children: [new TableCell({ borders, width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { fill: T.src, type: ShadingType.CLEAR }, margins: { top: 90, bottom: 90, left: 140, right: 140 }, children: runs })] })] });
}

const children = [];

// ---------- COVER ----------
if (meta.title) {
  children.push(new Paragraph({ spacing: { before: 1500, after: 60 }, children: [new TextRun({ text: meta.title, bold: true, size: 56, color: T.accent })] }));
  if (meta.subtitle) children.push(new Paragraph({ spacing: { after: 220 }, children: [new TextRun({ text: meta.subtitle, size: 28, color: T.dark })] }));
  if (meta.goalLine) children.push(new Paragraph({ spacing: { after: 40 }, border: { top: { style: BorderStyle.SINGLE, size: 6, color: T.accent, space: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6, color: T.accent, space: 6 } },
    children: [new TextRun({ text: meta.goalLine, bold: true, size: 24, color: T.accent2 })] }));
  [meta.preparedFor, meta.evidenceBase, meta.date].filter(Boolean).forEach((line, i) =>
    children.push(new Paragraph({ spacing: { before: i === 0 ? 300 : 0 }, children: [new TextRun({ text: line, size: 18, color: T.grey })] })));
  children.push(new Paragraph({ children: [new PageBreak()] }));
}

// ---------- BODY BLOCKS ----------
function pushBlock(b) {
  if (b.h1) children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(b.h1)] }));
  if (b.h2) children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(b.h2)] }));
  if (b.p) children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: b.p, size: 21, bold: !!b.bold, italics: !!b.italic, color: b.color || T.dark })] }));
  if (b.note) children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: b.note, italics: true, size: 17, color: T.accent2 })] }));
  if (b.bullets) b.bullets.forEach(t => children.push(new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 50 }, children: [new TextRun({ text: t, size: 20 })] })));
  if (b.numbers) b.numbers.forEach(t => children.push(new Paragraph({ numbering: { reference: "nums", level: 0 }, spacing: { after: 50 }, children: [new TextRun({ text: t, size: 20 })] })));
  if (b.table) { children.push(renderTable(b.table)); children.push(new Paragraph({ spacing: { after: 90 }, children: [new TextRun("")] })); }
  if (b.sources) children.push(renderSources(b.sources, b.sourcesTitle));
  if (b.pageBreak) children.push(new Paragraph({ children: [new PageBreak()] }));
  if (b.space) children.push(new Paragraph({ spacing: { after: 90 }, children: [new TextRun("")] }));
}
(data.body || []).forEach(pushBlock);

// ---------- DOC ----------
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 21, color: T.dark } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Arial", color: T.accent }, paragraph: { spacing: { before: 220, after: 140 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 23, bold: true, font: "Arial", color: T.dark }, paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 1 } },
    ]
  },
  numbering: { config: [
    { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    { reference: "nums", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: meta.header || meta.title || "AEO Playbook", size: 16, color: T.grey })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Page ", size: 16, color: T.grey }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: T.grey })] })] }) },
    children
  }]
});

const outName = process.argv[3] || (meta.outputFile || "AEO_Playbook.docx");
Packer.toBuffer(doc).then(buf => { fs.writeFileSync(outName, buf); console.log("Wrote " + path.resolve(outName)); });
