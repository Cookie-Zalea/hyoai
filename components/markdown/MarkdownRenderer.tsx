"use client";

import { memo, useMemo } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { CodeBlock } from "@/components/markdown/CodeBlock";
import { normalizeMathDelimiters } from "@/lib/math";

const REMARK_PLUGINS = [remarkGfm, remarkMath];
const REHYPE_PLUGINS: NonNullable<Options["rehypePlugins"]> = [
    rehypeHighlight,
    [
        rehypeKatex,
        {
            throwOnError: false,
            strict: "ignore",
            trust: false,
        },
    ],
];

const COMPONENTS = {
    pre: CodeBlock,
    a: (props: React.ComponentProps<"a">) => (
        <a {...props} target="_blank" rel="noopener noreferrer" />
    ),
};

/**
 * Memoized GitHub-flavored markdown renderer with syntax highlighting,
 * styled exclusively through the .chat-markdown rules in globals.css.
 *
 * @param content - Markdown source
 */
export const MarkdownRenderer = memo(function MarkdownRenderer({ content }: { content: string }) {
    const normalized = useMemo(() => normalizeMathDelimiters(content), [content]);

    return (
        <div className="chat-markdown">
            <ReactMarkdown
                remarkPlugins={REMARK_PLUGINS}
                rehypePlugins={REHYPE_PLUGINS}
                components={COMPONENTS}
            >
                {normalized}
            </ReactMarkdown>
        </div>
    );
});
