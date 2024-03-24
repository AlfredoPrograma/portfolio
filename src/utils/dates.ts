type WithPublishedDate = {
  data: {
    publishedAt: Date;
  };
}

export function sortDescByDate(a: WithPublishedDate, b: WithPublishedDate): number {
  return b.data.publishedAt.getTime() - a.data.publishedAt.getTime();
} 