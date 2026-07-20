import { Client } from "@notionhq/client";

export function createNotionClient(accessToken: string) {
  return new Client({ auth: accessToken });
}

export interface NotionPageSummary {
  id: string;
  title: string;
  lastEdited: string;
  properties: Record<string, unknown>;
}

export async function listDatabases(notion: Client) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (notion.search as any)({
    filter: { object: "database" },
    page_size: 50,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return response.results.map((db: any) => {
    if (db.object !== "database") return null;
    const titleText = (db.title as { plain_text: string }[]).map((t) => t.plain_text).join("");
    return {
      id: db.id,
      name: titleText || "無題DB",
      lastEdited: db.last_edited_time,
    };
  }).filter(Boolean);
}
