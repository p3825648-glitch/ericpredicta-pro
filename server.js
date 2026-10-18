const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("ERICPREDICTA PRO SERVER OK");
});

app.get("/api/matches", async (req, res) => {
  try {
    const response = await fetch(
      "https://bet261.mg/virtual/category/instant-league/8035/matches"
    );

    const html = await response.text();

    res.json({
      success: response.ok,
      status: response.status,
      message: "Bet261 page response received",
      html: html
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Tsy afaka mifandray amin'ny Bet261 ny serveur.",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log("ERICPREDICTA PRO server started on port " + PORT);
});
