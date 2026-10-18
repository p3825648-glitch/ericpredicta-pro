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
    const response = await fetch(BET261_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html"
      }
    });

    if (!response.ok) {
      throw new Error("Bet261 HTTP " + response.status);
    }

    const html = await response.text();

    const scripts = [
      ...html.matchAll(
        /<script[^>]+src=["']([^"']+)["']/gi
      )
    ].map(match => new URL(match[1], BET261_URL).href);

    const keywords = [
      "api",
      "graphql",
      "match",
      "matches",
      "result",
      "results",
      "score",
      "standings",
      "ranking",
      "fixture",
      "football",
      "virtual",
      "socket",
      "websocket",
      "http",
      "endpoint"
    ];

    const results = [];

    for (const scriptUrl of scripts) {
      try {
        const scriptResponse = await fetch(scriptUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        });

        if (!scriptResponse.ok) continue;

        const js = await scriptResponse.text();
        const found = [];

        for (const keyword of keywords) {
          let start = 0;
          let count = 0;

          while (count < 5) {
            const index = js.toLowerCase().indexOf(
              keyword,
              start
            );

            if (index === -1) break;

            found.push({
              keyword,
              context: js.slice(
                Math.max(0, index - 100),
                Math.min(js.length, index + 200)
              )
            });

            start = index + keyword.length;
            count++;
          }
        }

        if (found.length > 0) {
          results.push({
            script: scriptUrl,
            matches: found
          });
        }
      } catch (error) {
        results.push({
          script: scriptUrl,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      pageStatus: response.status,
      scriptsFound: scripts.length,
      possibleEndpoints: results
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
    message:
      "Tsy mbola voamarina ny API maka ny résultats Bet261.",
    nextStep: "/api/discover"
  });
});

app.listen(PORT, () => {
  console.log(
    "ERICPREDICTA PRO server started on port " + PORT
  );
});
