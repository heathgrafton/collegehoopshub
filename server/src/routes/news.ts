import { Router } from "express";
import { prisma } from "../prisma";

export const newsRouter = Router();

newsRouter.get("/", async (req, res) => {
  const { teamId } = req.query as { teamId?: string };

  const articles = await prisma.newsArticle.findMany({
    where: teamId ? { teamId } : undefined,
    include: { team: true },
    orderBy: { publishedAt: "desc" },
  });

  res.json({
    articles: articles.map((a) => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      body: a.body,
      source: a.source,
      publishedAt: a.publishedAt,
      imageUrl: a.imageUrl,
      team: a.team ? { id: a.team.id, shortName: a.team.shortName } : null,
    })),
  });
});
