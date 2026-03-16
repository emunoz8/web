import type { CategoryItem, ContentItem } from "../../../lib/api";
import type { EngagementSummary } from "../../../lib/services/ContentPlatformService";

export class ContentCategorySelectionModel {
  constructor(
    private readonly allCategoriesLabel: string,
    private readonly categories: CategoryItem[],
    private readonly selectedCategory: string,
  ) {}

  get selectedCategoryLabel(): string {
    if (!this.selectedCategory) {
      return this.allCategoriesLabel;
    }

    const matchingCategory = this.categories.find((category) => category.slug === this.selectedCategory);
    return matchingCategory ? matchingCategory.label : this.selectedCategory;
  }
}

export class ContentFeedCollectionModel {
  constructor(
    private readonly items: ContentItem[],
    private readonly engagementById: Record<number, EngagementSummary>,
  ) {}

  findItemsMissingEngagement(): ContentItem[] {
    return this.items.filter((item) => !this.engagementById[item.id]);
  }

  static mergeUniqueById(currentItems: ContentItem[], nextItems: ContentItem[]): ContentItem[] {
    if (nextItems.length === 0) {
      return currentItems;
    }

    const itemsById = new Map<number, ContentItem>();
    currentItems.forEach((item) => itemsById.set(item.id, item));
    nextItems.forEach((item) => itemsById.set(item.id, item));
    return Array.from(itemsById.values());
  }
}

export class ContentModalItemModel {
  constructor(private readonly currentItem: ContentItem | null) {}

  withUpdatedContent(updated: ContentItem): ContentItem | null {
    if (!this.currentItem || this.currentItem.id !== updated.id) {
      return this.currentItem;
    }

    return updated;
  }
}
