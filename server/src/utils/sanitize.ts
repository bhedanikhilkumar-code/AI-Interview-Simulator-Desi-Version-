import sanitizeHtml from "sanitize-html";

export const sanitizeText = (value: string) =>
  sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();
