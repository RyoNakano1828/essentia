import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export function createNotionClient(token: string) {
  return new Client({ auth: token });
}

export interface NotionDatabase {
  id: string;
  title: string;
  properties: Record<string, { type: string; name: string }>;
}

export interface NotionPage {
  id: string;
  date: string | null;
  done: boolean;
  note: string;
  numberValues: Record<string, number | null>;
  textValues: Record<string, string>;
}

// List all databases (data_sources) the integration can access
export async function listNotionDatabases(token: string): Promise<NotionDatabase[]> {
  const notion = createNotionClient(token);
  const results: NotionDatabase[] = [];

  let cursor: string | undefined;
  do {
    // In Notion client v5, "database" is now called "data_source"
    const response = await notion.search({
      filter: { property: "object", value: "data_source" },
      start_cursor: cursor,
      page_size: 100,
    });

    for (const item of response.results) {
      if (item.object !== "data_source") continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ds = item as any;
      const title: string = Array.isArray(ds.title)
        ? ds.title.map((t: { plain_text?: string }) => t.plain_text ?? "").join("")
        : "Untitled";

      const properties: Record<string, { type: string; name: string }> = {};
      if (ds.properties && typeof ds.properties === "object") {
        for (const [name, prop] of Object.entries(
          ds.properties as Record<string, { type: string }>
        )) {
          properties[name] = { type: prop.type, name };
        }
      }

      results.push({ id: ds.id as string, title, properties });
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return results;
}

// Fetch all pages from a database and normalize them
export async function fetchDatabasePages(
  token: string,
  databaseId: string
): Promise<NotionPage[]> {
  const notion = createNotionClient(token);
  const pages: NotionPage[] = [];

  let cursor: string | undefined;
  do {
    // In Notion client v5, databases.query is now dataSources.query with data_source_id
    const response = await notion.dataSources.query({
      data_source_id: databaseId,
      page_size: 100,
      start_cursor: cursor,
    });

    for (const raw of response.results) {
      if (raw.object !== "page") continue;
      const page = raw as PageObjectResponse;
      const parsed = parsePage(page);
      if (parsed.date) pages.push(parsed);
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return pages;
}

function parsePage(page: PageObjectResponse): NotionPage {
  const parsed: NotionPage = {
    id: page.id,
    date: null,
    done: true,
    note: "",
    numberValues: {},
    textValues: {},
  };

  for (const [name, prop] of Object.entries(page.properties)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = prop as any;

    if (p.type === "date" && p.date?.start) {
      if (!parsed.date) parsed.date = (p.date.start as string).split("T")[0];
    } else if (p.type === "checkbox") {
      const lname = name.toLowerCase();
      if (lname.includes("完了") || lname.includes("done") || lname.includes("チェック")) {
        parsed.done = p.checkbox as boolean;
      }
    } else if (p.type === "number" && p.number !== null && p.number !== undefined) {
      parsed.numberValues[name] = p.number as number;
    } else if (p.type === "rich_text") {
      const text = (p.rich_text as { plain_text: string }[])
        .map((t) => t.plain_text)
        .join("");
      if (text) parsed.textValues[name] = text;
    } else if (p.type === "title") {
      const text = (p.title as { plain_text: string }[])
        .map((t) => t.plain_text)
        .join("");
      if (text && !parsed.textValues["__title"]) {
        parsed.textValues["__title"] = text;
      }
    } else if (p.type === "select" && p.select?.name) {
      parsed.textValues[name] = p.select.name as string;
    } else if (p.type === "multi_select") {
      const labels = (p.multi_select as { name: string }[])
        .map((s) => s.name)
        .join(", ");
      if (labels) parsed.textValues[name] = labels;
    } else if (p.type === "created_time" && !parsed.date) {
      parsed.date = (p.created_time as string).split("T")[0];
    }
  }

  // Fallback: use page creation time
  if (!parsed.date) {
    parsed.date = page.created_time.split("T")[0];
  }

  // Combine all values into a note string
  const noteParts: string[] = [];
  for (const [k, v] of Object.entries(parsed.numberValues)) {
    if (v !== null) noteParts.push(`${k}: ${v}`);
  }
  for (const [k, v] of Object.entries(parsed.textValues)) {
    if (k !== "__title" && v) noteParts.push(`${k}: ${v}`);
  }
  parsed.note = noteParts.join(" | ");

  return parsed;
}

// Detect PERMA-like score columns from DB properties
export function detectPermaColumns(properties: Record<string, { type: string; name: string }>) {
  const positive: string[] = [];
  const meaning: string[] = [];
  const achieve: string[] = [];
  const reflection: string[] = [];

  for (const { type, name } of Object.values(properties)) {
    const n = name.toLowerCase();
    if (type === "number") {
      if (n.includes("positive") || n.includes("感情") || n.includes("ポジティブ") || n.includes("幸福")) {
        positive.push(name);
      } else if (n.includes("meaning") || n.includes("意味") || n.includes("充実")) {
        meaning.push(name);
      } else if (n.includes("achieve") || n.includes("達成") || n.includes("accomplish")) {
        achieve.push(name);
      }
    }
    if (type === "rich_text") {
      if (n.includes("振り返") || n.includes("reflect") || n.includes("memo") || n.includes("メモ") || n.includes("感想")) {
        reflection.push(name);
      }
    }
  }

  return { positive, meaning, achieve, reflection };
}
