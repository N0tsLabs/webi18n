import type { TextEntry } from '~/types';

const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'KBD', 'SAMP', 'VAR',
  'SVG', 'MATH', 'TEXTAREA', 'SELECT',
]);

const ATTR_FIELDS: [string, string][] = [
  ['placeholder', 'input, textarea, [placeholder]'],
  ['aria-label', '[aria-label]'],
  ['title', '[title]'],
  ['alt', 'img[alt]'],
];

let idCounter = 0;

function generateId(): string {
  return `t${++idCounter}`;
}

function shouldSkipNode(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const el = node as HTMLElement;
  if (SKIP_TAGS.has(el.tagName)) return true;
  if (el.closest('code, pre, .CodeMirror, .highlight')) return true;
  return false;
}

function extractTextNodes(root: HTMLElement): TextEntry[] {
  const entries: TextEntry[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (shouldSkipNode(parent)) return NodeFilter.FILTER_REJECT;
      const text = node.textContent?.trim();
      if (!text || text.length < 2 || text.length > 500) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    entries.push({
      id: generateId(),
      original: node.textContent!.trim(),
      selector: null,
      attribute: null,
      translated: null,
    });
  }

  return entries;
}

function extractAttributeTexts(root: HTMLElement): TextEntry[] {
  const entries: TextEntry[] = [];

  for (const [attr, selector] of ATTR_FIELDS) {
    const elements = root.querySelectorAll(selector);
    for (const el of elements) {
      const value = el.getAttribute(attr);
      if (!value || value.length < 2 || value.length > 500) continue;
      if (shouldSkipNode(el)) continue;

      entries.push({
        id: generateId(),
        original: value,
        selector: null,
        attribute: attr,
        translated: null,
      });
    }
  }

  return entries;
}

export function scrapePage(): TextEntry[] {
  idCounter = 0;
  const root = document.body;
  if (!root) return [];

  const textEntries = extractTextNodes(root);
  const attrEntries = extractAttributeTexts(root);

  return [...textEntries, ...attrEntries];
}
