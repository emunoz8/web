import type { CategoryItem, ContentItem } from "../../../lib/api";
import type { EngagementSummary } from "../../../lib/services/ContentPlatformService";
import {
  ContentCategorySelectionModel,
  ContentFeedCollectionModel,
  ContentModalItemModel,
} from "./ContentBrowserModels";

const categories: CategoryItem[] = [
  {
    id: 1,
    domain: "BLOG",
    slug: "java",
    label: "Java",
    createdAt: "2026-03-10T00:00:00Z",
  },
  {
    id: 2,
    domain: "BLOG",
    slug: "spring",
    label: "Spring",
    createdAt: "2026-03-10T00:00:00Z",
  },
];

const contentItems: ContentItem[] = [
  {
    id: 10,
    title: "First",
    slug: "first",
    createdAt: "2026-03-10T00:00:00Z",
    type: "BLOG",
  },
  {
    id: 11,
    title: "Second",
    slug: "second",
    createdAt: "2026-03-10T00:00:00Z",
    type: "BLOG",
  },
];

describe("ContentCategorySelectionModel", () => {
  it("returns the all-categories label when no category is selected", () => {
    const selection = new ContentCategorySelectionModel("All Blog Categories", categories, "");

    expect(selection.selectedCategoryLabel).toBe("All Blog Categories");
  });

  it("returns the matching category label when the slug exists", () => {
    const selection = new ContentCategorySelectionModel("All Blog Categories", categories, "spring");

    expect(selection.selectedCategoryLabel).toBe("Spring");
  });

  it("falls back to the raw slug when the category is unknown", () => {
    const selection = new ContentCategorySelectionModel("All Blog Categories", categories, "unknown");

    expect(selection.selectedCategoryLabel).toBe("unknown");
  });
});

describe("ContentFeedCollectionModel", () => {
  it("finds items missing engagement data", () => {
    const engagementById: Record<number, EngagementSummary> = {
      10: {
        likes: 4,
        comments: 1,
        likedByMe: false,
      },
    };

    const collection = new ContentFeedCollectionModel(contentItems, engagementById);

    expect(collection.findItemsMissingEngagement()).toEqual([contentItems[1]]);
  });

  it("merges content items by id without duplicating records", () => {
    const merged = ContentFeedCollectionModel.mergeUniqueById(contentItems, [
      {
        ...contentItems[1],
        title: "Second Updated",
      },
      {
        id: 12,
        title: "Third",
        slug: "third",
        createdAt: "2026-03-10T00:00:00Z",
        type: "BLOG",
      },
    ]);

    expect(merged).toEqual([
      contentItems[0],
      {
        ...contentItems[1],
        title: "Second Updated",
      },
      {
        id: 12,
        title: "Third",
        slug: "third",
        createdAt: "2026-03-10T00:00:00Z",
        type: "BLOG",
      },
    ]);
  });
});

describe("ContentModalItemModel", () => {
  it("updates the modal item when the ids match", () => {
    const updated = {
      ...contentItems[0],
      title: "First Updated",
    };

    expect(new ContentModalItemModel(contentItems[0]).withUpdatedContent(updated)).toEqual(updated);
  });

  it("keeps the current modal item when the ids do not match", () => {
    expect(new ContentModalItemModel(contentItems[0]).withUpdatedContent(contentItems[1])).toEqual(contentItems[0]);
  });

  it("keeps null modal state unchanged", () => {
    expect(new ContentModalItemModel(null).withUpdatedContent(contentItems[0])).toBeNull();
  });
});
