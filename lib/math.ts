// Placeholder prefix used while protecting code spans and existing math.
const PLACEHOLDER = "\u0000ZALEANAI_MATH_";

/**
 * Rewrite the LaTeX bracket/paren delimiters models commonly emit into the
 * dollar delimiters remark-math understands.
 *
 * CommonMark consumes `\(` / `\[` as escaped ASCII punctuation before any math
 * plugin sees them, so this must run on the raw Markdown string. Fenced code,
 * inline code and already-dollar-delimited math are protected first and
 * restored untouched.
 *
 * @param markdown - Raw Markdown source
 * @returns Markdown with `\(...\)` and `\[...\]` rewritten to `$...$` / `$$...$$`
 */
export function normalizeMathDelimiters(markdown: string): string {
    const protectedParts: string[] = [];
    const protect = (pattern: RegExp, value: string) =>
        value.replace(pattern, (match) => {
            const token = `${PLACEHOLDER}${protectedParts.length}\u0000`;
            protectedParts.push(match);
            return token;
        });

    let text = markdown;
    // Fenced code first, so its backticks cannot be mistaken for inline code.
    text = protect(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, text);
    text = protect(/`+[^`\n]*`+/g, text);
    // A whole line `$$...$$` is display math: put the delimiters on their own
    // lines before the dollar math is protected, so remark-math emits a block.
    text = text.replace(
        /(^|\n)([ \t]*)\$\$([^\n]*?)\$\$[ \t]*(?=\n|$)/g,
        (_match, lead: string, _indent: string, body: string) => `${lead}$$\n${body}\n$$`,
    );
    // Leave math that already uses dollar delimiters alone (including any
    // `\\[2pt]` line-break spacing inside it).
    text = protect(/\$\$[\s\S]*?\$\$/g, text);
    text = protect(/\$[^$\n]*?\$/g, text);

    // Block form: \[ ... \] with the delimiters at line boundaries.
    text = text.replace(
        /(^|\n)([ \t]*)\\{1,2}\[[ \t]*([\s\S]*?)[ \t]*\\{1,2}\][ \t]*(?=\n|$)/g,
        (_match, lead: string, _indent: string, body: string) => `${lead}$$\n${body}\n$$`,
    );

    // Inline form: \( ... \) on one line.
    text = text.replace(/\\{1,2}\(([^\n]*?)\\{1,2}\)/g, (_match, body: string) => `$${body}$`);

    // Same-line \[ ... \]; skip TeX line-break spacing such as \\[2pt].
    text = text.replace(/\\{1,2}\[([^\]\n]*?)\\{1,2}\]/g, (match, body: string) =>
        /^\d+(?:\.\d+)?(?:pt|em|ex|cm|mm|in|mu)$/.test(body.trim()) ? match : `$$${body}$$`,
    );

    return text.replace(
        new RegExp(`${PLACEHOLDER}(\\d+)\\u0000`, "g"),
        (_match, index: string) => protectedParts[Number(index)] ?? "",
    );
}
