import type { TranslationFile, TextEntry } from '~/types';

const ATTRIBUTES = ['placeholder', 'aria-label', 'title', 'alt'];

function findTextNodeByContent(text: string): Text | null {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.textContent?.trim() === text
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });
  return walker.nextNode() as Text | null;
}

function replaceTextContent(textNode: Text, translated: string): void {
  textNode.textContent = textNode.textContent!.replace(textNode.textContent!.trim(), translated);
}

function insertBilingualAfter(textNode: Text, translated: string): void {
  const parent = textNode.parentElement;
  if (!parent) return;

  const existing = parent.querySelector('.webi18n-bilingual');
  if (existing) return;

  const span = document.createElement('span');
  span.className = 'webi18n-bilingual';
  span.textContent = translated;
  span.style.cssText = 'color: #0969da; font-size: 0.9em; margin-left: 4px; opacity: 0.8;';
  parent.appendChild(span);
}

function replaceAttribute(el: Element, attr: string, translated: string): void {
  el.setAttribute(attr, translated);
}

export function applyTranslation(data: TranslationFile, mode: 'replace' | 'bilingual'): void {
  const { texts } = data;

  for (const entry of texts) {
    if (!entry.translated) continue;

    if (entry.attribute) {
      const selector = entry.attribute === 'placeholder'
        ? 'input[placeholder], textarea[placeholder]'
        : entry.attribute === 'aria-label'
          ? '[aria-label]'
          : entry.attribute === 'title'
            ? '[title]'
            : `img[alt]`;

      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        if (el.getAttribute(entry.attribute) === entry.original) {
          if (mode === 'replace') {
            replaceAttribute(el, entry.attribute, entry.translated);
          }
          break;
        }
      }
    } else {
      const textNode = findTextNodeByContent(entry.original);
      if (!textNode) continue;

      if (mode === 'replace') {
        replaceTextContent(textNode, entry.translated);
      } else {
        insertBilingualAfter(textNode, entry.translated);
      }
    }
  }
}

export function removeBilingual(): void {
  document.querySelectorAll('.webi18n-bilingual').forEach((el) => el.remove());
}
