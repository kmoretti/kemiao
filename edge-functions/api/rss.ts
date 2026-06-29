interface RssEntry {
  label: string;
  href: string;
  date: string;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
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
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
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

export default function onRequest(context: { request: Request }) {
  const url = new URL(context.request.url);
  const feedUrl = url.searchParams.get("url");
  if (!feedUrl) {
    return new Response(JSON.stringify({ error: "Missing 'url' query parameter" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  return fetch(feedUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
      return res.text();
    })
    .then((xml) => {
      const isAtom = /<feed[\s>]/i.test(xml);
      const entries = isAtom ? parseAtom(xml) : parseRss(xml);
      return new Response(JSON.stringify(entries), {
        headers: {
          "content-type": "application/json",
          "cache-control": "public, max-age=600",
        },
      });
    })
    .catch((err: Error) => {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    });
}
