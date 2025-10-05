import sanitizeHtml from 'sanitize-html';

export function cleanText(text, maxLength = 2000) {
  const cleaned = sanitizeHtml(text || '', {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();

  return cleaned.slice(0, maxLength);
}
