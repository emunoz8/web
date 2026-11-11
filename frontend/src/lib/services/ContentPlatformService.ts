import { CategoryDomain, CategoryItem, ContentItem } from "../api";
import {
  getLocalContentById,
  getLocalContentBySlug,
  listLocalCategories,
  listLocalContentsPage,
} from "../../features/portfolio/data/localContent";

export type EngagementSummary = {
  likes: number;
  comments: number;
  likedByMe: boolean;
};

export type CommentTreeNode = {
  id: number;
  parentId: number | null;
  userId: number;
  username: string;
  body: string;
  createdAt: string;
  children: CommentTreeNode[];
};

type ContentListParams = {
  type: CategoryDomain;
  category?: string;
  q?: string;
  page?: number;
  size?: number;
  signal?: AbortSignal;
};

export type ContentPage = {
  content: ContentItem[];
  engagementById: Record<number, EngagementSummary>;
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

type CategoryCreateInput = {
  domain: CategoryDomain;
  label: string;
  slug: string;
};

type ProjectCreateInput = {
  title: string;
  slug: string;
  description: string;
  projectUrl?: string;
};

type ProjectUpdateInput = {
  title?: string;
  slug?: string;
  description?: string;
  projectUrl?: string;
};

type BlogCreateInput = {
  title: string;
  slug: string;
  bodyMd: string;
};

type BlogUpdateInput = {
  title?: string;
  slug?: string;
  bodyMd?: string;
};

type CommentCreateInput = {
  contentId: number;
  body: string;
  parentId: number | null;
};

export class ContentPlatformService {
  async listCategories(domain: CategoryDomain, _signal?: AbortSignal): Promise<CategoryItem[]> {
    return listLocalCategories(domain);
  }

  async listContentsPage(params: ContentListParams): Promise<ContentPage> {
    return listLocalContentsPage({
      type: params.type,
      category: params.category,
      q: params.q,
      page: params.page,
      size: params.size,
    });
  }

  async listContents(params: ContentListParams): Promise<ContentItem[]> {
    const page = await this.listContentsPage(params);
    return page.content;
  }

  async getContentById(contentId: number, _signal?: AbortSignal): Promise<ContentItem> {
    const found = getLocalContentById(contentId);
    if (!found) {
      throw new Error("Content not found.");
    }
    return found;
  }

  async getContentBySlug(slug: string, _signal?: AbortSignal): Promise<ContentItem> {
    const found = getLocalContentBySlug(slug);
    if (!found) {
      throw new Error("Content not found.");
    }
    return found;
  }

  async createProject(_input: ProjectCreateInput): Promise<ContentItem> {
    throw new Error("Runtime admin publishing is retired in static frontend mode.");
  }

  async updateProject(_id: number, _input: ProjectUpdateInput): Promise<ContentItem> {
    throw new Error("Runtime admin publishing is retired in static frontend mode.");
  }

  async deleteContent(_id: number): Promise<void> {
    throw new Error("Runtime admin publishing is retired in static frontend mode.");
  }

  async createBlog(_input: BlogCreateInput): Promise<ContentItem> {
    throw new Error("Runtime admin publishing is retired in static frontend mode.");
  }

  async updateBlog(_id: number, _input: BlogUpdateInput): Promise<ContentItem> {
    throw new Error("Runtime admin publishing is retired in static frontend mode.");
  }

  async createCategory(_input: CategoryCreateInput): Promise<number> {
    throw new Error("Runtime admin publishing is retired in static frontend mode.");
  }

  async attachCategory(_contentId: number, _categoryId: number): Promise<void> {
    throw new Error("Runtime admin publishing is retired in static frontend mode.");
  }

  async listCommentTree(_contentId: number, _signal?: AbortSignal): Promise<CommentTreeNode[]> {
    return [];
  }

  async listComments(_contentId: number, _signal?: AbortSignal): Promise<unknown[]> {
    return [];
  }

  async createComment(_input: CommentCreateInput): Promise<void> {
    throw new Error("Comments are retired in static frontend mode.");
  }

  async deleteComment(_commentId: number): Promise<void> {
    throw new Error("Comments are retired in static frontend mode.");
  }

  async getLikeCount(_contentId: number, _signal?: AbortSignal): Promise<number> {
    return 0;
  }

  async isLikedByMe(_contentId: number, _signal?: AbortSignal): Promise<boolean> {
    return false;
  }

  async like(_contentId: number): Promise<void> {
    throw new Error("Likes are retired in static frontend mode.");
  }

  async unlike(_contentId: number): Promise<void> {
    throw new Error("Likes are retired in static frontend mode.");
  }

  async getEngagementSummary(_contentId: number, _isAuthenticated = false, _signal?: AbortSignal): Promise<EngagementSummary> {
    return {
      likes: 0,
      comments: 0,
      likedByMe: false,
    };
  }
}

export const contentPlatformService = new ContentPlatformService();
