import { describe, expect, it } from "vitest";
import { blogSlug, sortByPublishedAtDesc } from "./blogSlug";

describe("blogSlug", () => {
  it("strips the blog- prefix", () => {
    expect(blogSlug("blog-jauns-oktas-limits")).toBe("jauns-oktas-limits");
  });

  it("leaves a string without the prefix unchanged", () => {
    expect(blogSlug("jauns-oktas-limits")).toBe("jauns-oktas-limits");
  });
});

describe("sortByPublishedAtDesc", () => {
  it("orders entries newest-first", () => {
    const entries = [
      { publishedAt: "2026-01-15", label: "January" },
      { publishedAt: "2026-08-01", label: "August" },
      { publishedAt: "2026-03-20", label: "March" },
    ];
    expect(sortByPublishedAtDesc(entries).map((e) => e.label)).toEqual([
      "August",
      "March",
      "January",
    ]);
  });

  it("does not mutate the input array", () => {
    const entries = [
      { publishedAt: "2026-01-01" },
      { publishedAt: "2026-06-01" },
    ];
    const copy = [...entries];
    sortByPublishedAtDesc(entries);
    expect(entries).toEqual(copy);
  });
});
