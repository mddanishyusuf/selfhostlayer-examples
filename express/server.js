const express = require("express");

const app = express();
app.get("/", (_req, res) => res.send("example-express"));
app.get("/health", (_req, res) => res.send("ok"));

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOSTNAME ?? "127.0.0.1";
app.listen(port, host, () => console.log(`example-express on ${host}:${port}`));
