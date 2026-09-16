import express from "express";
import cors from "cors";
import { scoreboardRouter } from "./routes/scoreboard";
import { gamesRouter } from "./routes/games";
import { teamsRouter } from "./routes/teams";
import { playersRouter } from "./routes/players";
import { playerMovesRouter } from "./routes/player-moves";
import { newsRouter } from "./routes/news";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/scoreboard", scoreboardRouter);
app.use("/api/games", gamesRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/players", playersRouter);
app.use("/api/player-moves", playerMovesRouter);
app.use("/api/news", newsRouter);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`CollegeHoopsHub API listening on http://localhost:${port}`);
});
