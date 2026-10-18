const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

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
    const url =
      "https://bet261.mg/virtual/category/instant-league/8035/matches";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html"
      }
    });

    const html = await response.text();

    const scripts = [
      ...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)
    ].map(match => {
      const src = match[1];

      return src.startsWith("http")
        ? src
        : new URL(src, url).href;
    });

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

        const paths = js.match(
          /["'`](?:https?:\/\/[^"'`\s]+|\/[^"'`\s]*(?:api|graphql|match|result|virtual)[^"'`\s]*)["'`]/gi
        ) || [];

        if (paths.length > 0) {
          results.push({
            script: scriptUrl,
            paths: [...new Set(paths)].slice(0, 50)
          });
        }
      } catch (error) {
        // Tohizo ny fikarohana amin'ny script manaraka
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

app.get("/api/matches", async (req, res) => {
  res.json({
    success: false,
    message:
      "Mbola tadiavina ny API tena misy ny résultats Bet261.",
    nextStep: "/api/discover"
  });
});

app.listen(PORT, () => {
  console.log(
    "ERICPREDICTA PRO server started on port " + PORT
  );
});
