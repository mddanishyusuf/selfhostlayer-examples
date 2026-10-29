// A visit counter in the app's Redis (REDIS_URL, added in the panel). No
// client library: one INCR or GET over a socket. GET /api/redis returns the
// count; ?add=1 adds one. 503 when the app has no Redis.
import { connect } from "node:net";

export const dynamic = "force-dynamic";

function command(url, args) {
  return new Promise((resolve, reject) => {
    const socket = connect({ host: url.hostname, port: Number(url.port) });
    const send = (parts) => socket.write(`*${parts.length}\r\n${parts.map((p) => `$${Buffer.byteLength(p)}\r\n${p}\r\n`).join("")}`);
    let data = "";
    socket.setTimeout(3000, () => socket.destroy(new Error("timeout")));
    socket.on("error", reject);
    socket.on("connect", () => {
      send(["AUTH", decodeURIComponent(url.username || "default"), decodeURIComponent(url.password)]);
      send(args);
    });
    socket.on("data", (chunk) => {
      data += chunk;
      const lines = data.split("\r\n");
      if (lines[0].startsWith("-")) return socket.destroy(new Error(lines[0]));
      // +OK for AUTH, then :<n> for INCR or $len/value (or $-1) for GET.
      if (lines.length >= 3 && (lines[1].startsWith(":") || lines[1] === "$-1" || (lines[1].startsWith("$") && lines.length >= 4))) {
        socket.end();
        if (lines[1].startsWith("-")) return reject(new Error(lines[1]));
        resolve(lines[1].startsWith(":") ? Number(lines[1].slice(1)) : lines[1] === "$-1" ? 0 : Number(lines[2]));
      }
    });
  });
}

export async function GET(request) {
  if (!process.env.REDIS_URL) return Response.json({ error: "no REDIS_URL" }, { status: 503 });
  const url = new URL(process.env.REDIS_URL);
  const add = new URL(request.url).searchParams.get("add") === "1";
  try {
    return Response.json({ visits: await command(url, add ? ["INCR", "visits"] : ["GET", "visits"]) });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 502 });
  }
}
