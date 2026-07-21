import path from "node:path";
import {
  explorableAttributesSchema,
  exerciseAttributesSchema,
  lessonFrontmatterSchema,
  type ParsedExplorable,
  type ParsedExercise,
  type ParsedLesson,
  type SourcePosition,
} from "@explorables/course-schema";
import matter from "gray-matter";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

interface Point {
  line?: number;
  column?: number;
}

interface DirectiveNode {
  type: string;
  name?: string;
  attributes?: Record<string, string | null | undefined>;
  children?: DirectiveNode[];
  value?: string;
  url?: string;
  position?: { start?: Point };
  data?: {
    hName?: string;
    hProperties?: Record<string, string | number>;
  };
}

const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "section"],
  attributes: {
    ...defaultSchema.attributes,
    section: [
      "className",
      "dataExplorable",
      "dataExercise",
      "dataInstanceId",
      "dataPath",
      "dataTitle",
      "dataHeight",
    ],
    a: [...(defaultSchema.attributes?.a ?? []), "className", "dataExercisePath"],
  },
};

function sourcePosition(file: string, node: DirectiveNode): SourcePosition {
  return {
    file,
    line: node.position?.start?.line ?? 1,
    column: node.position?.start?.column ?? 1,
  };
}

function normaliseAttributes(
  attributes: DirectiveNode["attributes"],
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(attributes ?? {}).flatMap(([key, value]) =>
      typeof value === "string" ? [[key, value]] : [],
    ),
  );
}

function nodeText(node: DirectiveNode): string {
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map(nodeText).join(" ").replace(/\s+/g, " ").trim();
}

function markdownPlugin(file: string, lessonId: string) {
  return (tree: DirectiveNode) => {
    let explorableIndex = 0;
    const explorables: ParsedExplorable[] = [];
    const exercises: ParsedExercise[] = [];
    const links: ParsedLesson["links"] = [];

    visit(tree as never, (node: DirectiveNode) => {
      if (node.type === "link" && node.url) {
        links.push({ href: node.url, position: sourcePosition(file, node) });
      }

      if (node.type !== "containerDirective") return;
      if (node.name !== "explorable" && node.name !== "exercise") {
        throw new Error(
          `${file}:${node.position?.start?.line ?? 1}:${node.position?.start?.column ?? 1} Unknown directive "${node.name ?? ""}". Only explorable and exercise are supported.`,
        );
      }

      node.data ??= {};
      node.data.hName = "section";
      const rawAttributes = normaliseAttributes(node.attributes);

      if (node.name === "explorable") {
        const attributes = explorableAttributesSchema.parse(rawAttributes);
        const instanceId =
          attributes.id ?? `${lessonId}-explorable-${++explorableIndex}`;
        node.data.hProperties = {
          className: "explorable",
          dataExplorable: "true",
          dataInstanceId: instanceId,
          dataTitle: attributes.title,
          dataHeight: attributes.height,
        };
        explorables.push({
          kind: "explorable",
          attributes,
          instanceId,
          fallbackHtml: nodeText(node),
          position: sourcePosition(file, node),
        });
      } else {
        const attributes = exerciseAttributesSchema.parse(rawAttributes);
        node.data.hProperties = {
          className: "exercise",
          dataExercise: "true",
          dataPath: attributes.path,
          dataTitle: attributes.title,
        };
        exercises.push({
          kind: "exercise",
          attributes,
          fallbackHtml: nodeText(node),
          position: sourcePosition(file, node),
        });
      }
    });

    Object.assign(tree, { explorables, exercises, links });
  };
}

export async function renderMarkdown(
  markdown: string,
  file = "<markdown>",
  lessonId = "document",
): Promise<Pick<ParsedLesson, "html" | "explorables" | "exercises" | "links">> {
  const tree = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ["yaml"])
    .use(remarkDirective)
    .parse(markdown) as DirectiveNode;
  const transformer = markdownPlugin(file, lessonId);
  transformer(tree);
  const metadata = tree as DirectiveNode & {
    explorables: ParsedExplorable[];
    exercises: ParsedExercise[];
    links: ParsedLesson["links"];
  };
  const compiler = unified()
    .use(remarkRehype)
    .use(rehypeSanitize, schema)
    .use(rehypeStringify);
  const hast = await compiler.run(tree as never);
  const html = compiler.stringify(hast);

  return {
    html,
    explorables: metadata.explorables,
    exercises: metadata.exercises,
    links: metadata.links,
  };
}

export async function parseLesson(
  file: string,
  markdown: string,
): Promise<ParsedLesson> {
  const parsedMatter = matter(markdown);
  const frontmatter = lessonFrontmatterSchema.parse(parsedMatter.data);
  const rendered = await renderMarkdown(markdown, file, frontmatter.id);
  return { frontmatter, file, ...rendered };
}

export function resolveCoursePath(
  root: string,
  fromFile: string,
  reference: string,
): string {
  const resolved = path.resolve(
    path.dirname(fromFile),
    reference.split("#")[0] ?? reference,
  );
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path escapes the course root: ${reference}`);
  }
  return resolved;
}

export function lessonLinksFromCourse(markdown: string): string[] {
  const links: string[] = [];
  const pattern = /^\s*\d+\.\s+\[[^\]]+\]\(([^)]+\.md(?:#[^)]+)?)\)/gm;
  for (const match of markdown.matchAll(pattern)) {
    if (match[1]) links.push(match[1].split("#")[0] ?? match[1]);
  }
  return links;
}
