/**
 * Simple Frontmatter Parser and Serializer
 */

/**
 * Extracts YAML frontmatter and markdown body from markdown content string.
 * @param {string} content
 * @returns {{ data: Record<string, string>, content: string }}
 */
export function parseFrontmatter(content) {
  if (typeof content !== 'string') {
    return { data: {}, content: '' };
  }

  const str = content.trimStart();
  if (!str.startsWith('---')) {
    return { data: {}, content };
  }

  const endIdx = str.indexOf('\n---', 3);
  if (endIdx === -1) {
    return { data: {}, content };
  }

  const frontmatterStr = str.slice(3, endIdx).trim();
  const body = str.slice(endIdx + 4).replace(/^[\r\n]+/, '');

  const data = {};
  const lines = frontmatterStr.split(/\r?\n/);
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      // Remove surrounding quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      data[key] = val;
    }
  }

  return { data, content: body };
}

/**
 * Serializes frontmatter data object and body content into markdown text string.
 * @param {Record<string, string>} data
 * @param {string} body
 * @returns {string}
 */
export function stringifyFrontmatter(data, body = '') {
  const keys = Object.keys(data || {});
  if (keys.length === 0) {
    return body;
  }

  const yamlLines = keys.map(key => {
    const val = String(data[key]);
    // Escape or quote value if needed
    if (val.includes('\n') || val.includes('"') || val.includes(':') || val.includes('#')) {
      return `${key}: "${val.replace(/"/g, '\\"')}"`;
    }
    return `${key}: ${val}`;
  });

  return `---\n${yamlLines.join('\n')}\n---\n\n${body}`;
}

/**
 * Generates a filename based on current timestamp format: YYYY-MM-DD-HHMM.SSS.md
 * @param {Date} [date]
 * @returns {string}
 */
export function generateNoteFilename(date = new Date()) {
  const pad = (num, len = 2) => String(num).padStart(len, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const milliseconds = pad(date.getMilliseconds(), 3);

  return `${year}-${month}-${day}-${hours}${minutes}.${milliseconds}.md`;
}
