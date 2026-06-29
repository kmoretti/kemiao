interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

interface RssEntry {
  label: string;
  href: string;
  date: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function extractText(raw: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const m = raw.match(re);
  if (!m) return "";
  let content = m[1];
  const cdata = content.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  if (cdata) content = cdata[1];
  content = stripHtml(content);
  content = decodeEntities(content);
  return content.trim();
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}.${m}`;
  } catch {
    return dateStr;
  }
}

function parseRss(xml: string): RssEntry[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  return items.map((item) => ({
    label: extractText(item, "title"),
    href: extractText(item, "link"),
    date: formatDate(extractText(item, "pubDate")),
  }));
}

function parseAtom(xml: string): RssEntry[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
  return entries.map((entry) => {
    let href = "";
    const linkM = entry.match(/<link[^>]*href="([^"]*)"/);
    if (linkM) href = linkM[1];

    const published = extractText(entry, "published") || extractText(entry, "updated");

    return {
      label: extractText(entry, "title"),
      href,
      date: formatDate(published),
    };
  });
}

async function handleRss(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const feedUrl = url.searchParams.get("url");
  if (!feedUrl) {
    return new Response(JSON.stringify({ error: "Missing 'url' query parameter" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const res = await fetch(feedUrl);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Feed fetch failed: ${res.status}` }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }
    const xml = await res.text();

    const isAtom = /<feed[\s>]/i.test(xml);
    const entries = isAtom ? parseAtom(xml) : parseRss(xml);

    return new Response(JSON.stringify(entries), {
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
        "cache-control": "public, max-age=600",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/rss") {
      return handleRss(request);
    }
    return env.ASSETS.fetch(request);
  },
};
