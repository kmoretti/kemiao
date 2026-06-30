const TARGET = "https://live.081531.xyz/api/current";

export default function onRequest(context: { request: Request }) {
  return fetch(TARGET, {
    headers: {
      accept: "application/json",
    },
  }).then((res) => {
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Upstream failed: ${res.status}` }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(res.body, {
      status: res.status,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
        "cache-control": "public, max-age=15",
      },
    });
  }).catch((err: Error) => {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  });
}
