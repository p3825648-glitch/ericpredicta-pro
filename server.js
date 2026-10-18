const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

const BET261_URL =
  "https://bet261.mg/virtual/category/instant-league/8035/matches";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.get("/", (req, res) => {
  res.send("ERICPREDICTA PRO SERVER OK");
});

app.get("/api/discover", async (req, res) => {
  try {
    const page = await fetch(BET261_URL, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const html = await page.text();

    const scriptMatches = [
      ...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)
    ];

    const scripts = scriptMatches.map(match =>
      new URL(match[1], BET261_URL).href
    );

    const details = [];

    for (const scriptUrl of scripts) {
      try {
        const response = await fetch(scriptUrl, {
          headers: { "User-Agent": "Mozilla/5.0" }
        });

        const content = await response.text();

        details.push({
          url: scriptUrl,
          status: response.status,
          contentType: response.headers.get("content-type"),
          contentLength: content.length,
          beginning: content.slice(0, 300),
          containsApi: /api|graphql/i.test(content),
          containsMatch: /matches|fixtures|standings/i.test(content)
        });
      } catch (error) {
        details.push({
          url: scriptUrl,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      pageStatus: page.status,
      htmlLength: html.length,
      scriptsFound: scripts.length,
      scriptDetails: details
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/api/matches", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Mbola tsy voamarina ny API misy ny résultats Bet261."
  });
});

app.listen(PORT, () => {
  console.log("ERICPREDICTA PRO server started on port " + PORT);
});
