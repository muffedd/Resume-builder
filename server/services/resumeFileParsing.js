import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

function normalizeExtractedText(value) {
  return String(value || '')
    .replace(/\u0000/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function extractDocTextFromBuffer(buffer, fileName) {
  const { default: WordExtractor } = await import('word-extractor');
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-doc-'));
  const tempFilePath = path.join(tempDir, fileName);

  try {
    await fs.writeFile(tempFilePath, buffer);
    const extractor = new WordExtractor();
    const document = await extractor.extract(tempFilePath);
    return document.getBody();
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function extractResumeTextFromFile(file) {
  if (!file) {
    return { text: '', parser: null };
  }

  const extension = path.extname(file.originalname || '').toLowerCase();

  if (extension === '.pdf') {
    const parser = new PDFParse({ data: file.buffer });

    try {
      const parsed = await parser.getText();
      return { text: normalizeExtractedText(parsed.text), parser: 'pdf-parse' };
    } finally {
      await parser.destroy();
    }
  }

  if (extension === '.docx') {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    return { text: normalizeExtractedText(parsed.value), parser: 'mammoth' };
  }

  if (extension === '.doc') {
    const text = await extractDocTextFromBuffer(file.buffer, file.originalname || 'resume.doc');
    return { text: normalizeExtractedText(text), parser: 'word-extractor' };
  }

  if (extension === '.txt' || !extension) {
    return { text: normalizeExtractedText(file.buffer.toString('utf8')), parser: 'text' };
  }

  throw new Error('Unsupported file type. Upload a PDF, DOCX, DOC, or TXT resume.');
}
