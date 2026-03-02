import { apiUrl, CategoryDomain, CategoryItem, ContentItem, PagedResponse } from "../api";

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

type MessagePayload = {
  message?: unknown;
  id?: unknown;
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

type JsonRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  token?: string | null;
  body?: unknown;
  signal?: AbortSignal;
};

type LikeCountResponse = {
  count?: number;
};

type LikeMeResponse = {
  liked?: boolean;
};

const parseJsonSafe = (raw: string): unknown | undefined => {
  if (!raw) {
    return undefined;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

const extractMessage = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const maybe = payload as MessagePayload;
  if (typeof maybe.message === "string" && maybe.message.trim() !== "") {
    return maybe.message;
  }
  return null;
};

const asNumericId = (payload: unknown): number | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const maybe = payload as MessagePayload;
  return typeof maybe.id === "number" ? maybe.id : null;
};

class ApiClient {
  async request(path: string, options: JsonRequestOptions = {}): Promise<Response> {
    const { method = "GET", token, body, signal } = options;
    const headers: HeadersInit = {};

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (token && token.trim() !== "") {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(apiUrl(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  }

  async readBody(response: Response): Promise<unknown | undefined> {
    const raw = await response.text();
    const parsed = parseJsonSafe(raw);
    if (parsed !== undefined) {
      return parsed;
    }
    return raw || undefined;
  }

  async throwWithResponse(response: Response, fallback: string): Promise<never> {
    const payload = await this.readBody(response);
    const message = extractMessage(payload);
    throw new Error(message ?? fallback);
  }

  async jsonOrThrow<T>(path: string, options: JsonRequestOptions, fallback: string): Promise<T> {
    const response = await this.request(path, options);
    if (!response.ok) {
      await this.throwWithResponse(response, fallback);
    }
    return (await response.json()) as T;
  }

  async bodyOrThrow(path: string, options: JsonRequestOptions, fallback: string): Promise<unknown | undefined> {
    const response = await this.request(path, options);
    const payload = await this.readBody(response);
    if (!response.ok) {
      const message = extractMessage(payload);
      throw new Error(message ?? fallback);
    }
    return payload;
  }
}

export class ContentPlatformService {
  constructor(private readonly client: ApiClient) {}

  async listCategories(domain: CategoryDomain, signal?: AbortSignal): Promise<CategoryItem[]> {
    return this.client.jsonOrThrow<CategoryItem[]>(
      `/api/categories?domain=${domain}`,
      { signal },
      "Could not load categories."
    );
  }

  async listContentsPage(params: ContentListParams): Promise<ContentPage> {
    const query = new URLSearchParams({
      type: params.type,
      page: String(params.page ?? 0),
      size: String(params.size ?? 20),
    });

    if (params.category && params.category.trim() !== "") {
      query.set("category", params.category.trim());
    }
    if (params.q && params.q.trim() !== "") {
      query.set("q", params.q.trim());
    }

    const body = await this.client.jsonOrThrow<PagedResponse<ContentItem>>(
      `/api/contents?${query.toString()}`,
      { signal: params.signal },
      "Could not load content list."
    );
    const content = body.content ?? [];
    const number = typeof body.number === "number" ? body.number : params.page ?? 0;
    const size = typeof body.size === "number" ? body.size : params.size ?? 20;
    const totalPages = typeof body.totalPages === "number" ? body.totalPages : number + 1;
    const totalElements = typeof body.totalElements === "number" ? body.totalElements : content.length;
    const numberOfElements = typeof body.numberOfElements === "number" ? body.numberOfElements : content.length;
    const first = typeof body.first === "boolean" ? body.first : number === 0;
    const last = typeof body.last === "boolean" ? body.last : number + 1 >= totalPages;
    const empty = typeof body.empty === "boolean" ? body.empty : content.length === 0;

    return {
      content,
      number,
      size,
      totalPages,
      totalElements,
      numberOfElements,
      first,
      last,
      empty,
    };
  }

  async listContents(params: ContentListParams): Promise<ContentItem[]> {
    const page = await this.listContentsPage(params);
    return page.content;
  }

  async getContentById(contentId: number, signal?: AbortSignal): Promise<ContentItem> {
    return this.client.jsonOrThrow<ContentItem>(
      `/api/contents/id/${contentId}`,
      { signal },
      "Could not load content."
    );
  }

  async createProject(token: string, input: ProjectCreateInput): Promise<ContentItem> {
    const payload = await this.client.bodyOrThrow(
      "/api/admin/projects",
      {
        method: "POST",
        token,
        body: input,
      },
      "Project create failed."
    );

    if (!payload || typeof payload !== "object") {
      throw new Error("Project create returned invalid response.");
    }
    return payload as ContentItem;
  }

  async updateProject(token: string, id: number, input: ProjectUpdateInput): Promise<ContentItem> {
    const payload = await this.client.bodyOrThrow(
      `/api/admin/projects/${id}`,
      {
        method: "PUT",
        token,
        body: input,
      },
      "Project update failed."
    );

    if (!payload || typeof payload !== "object") {
      throw new Error("Project update returned invalid response.");
    }
    return payload as ContentItem;
  }

  async createBlog(token: string, input: BlogCreateInput): Promise<ContentItem> {
    const payload = await this.client.bodyOrThrow(
      "/api/admin/blogs",
      {
        method: "POST",
        token,
        body: input,
      },
      "Blog create failed."
    );

    if (!payload || typeof payload !== "object") {
      throw new Error("Blog create returned invalid response.");
    }
    return payload as ContentItem;
  }

  async updateBlog(token: string, id: number, input: BlogUpdateInput): Promise<ContentItem> {
    const payload = await this.client.bodyOrThrow(
      `/api/admin/blogs/${id}`,
      {
        method: "PUT",
        token,
        body: input,
      },
      "Blog update failed."
    );

    if (!payload || typeof payload !== "object") {
      throw new Error("Blog update returned invalid response.");
    }
    return payload as ContentItem;
  }

  async createCategory(token: string, input: CategoryCreateInput): Promise<number> {
    const payload = await this.client.bodyOrThrow(
      "/api/admin/categories",
      {
        method: "POST",
        token,
        body: input,
      },
      "Category create failed."
    );

    const id = asNumericId(payload);
    if (id == null) {
      throw new Error("Category create returned invalid response.");
    }
    return id;
  }

  async attachCategory(token: string, contentId: number, categoryId: number): Promise<void> {
    const response = await this.client.request(`/api/admin/contents/${contentId}/categories/${categoryId}`, {
      method: "POST",
      token,
    });
    if (!response.ok) {
      await this.client.throwWithResponse(response, "Category attach failed.");
    }
  }

  async listCommentTree(contentId: number, signal?: AbortSignal): Promise<CommentTreeNode[]> {
    return this.client.jsonOrThrow<CommentTreeNode[]>(
      `/api/comments/tree?contentId=${encodeURIComponent(String(contentId))}`,
      { signal },
      "Could not load comments."
    );
  }

  async listComments(contentId: number, signal?: AbortSignal): Promise<unknown[]> {
    const body = await this.client.jsonOrThrow<unknown>(
      `/api/comments?contentId=${encodeURIComponent(String(contentId))}`,
      { signal },
      "Could not load comments."
    );
    return Array.isArray(body) ? body : [];
  }

  async createComment(token: string, input: CommentCreateInput): Promise<void> {
    await this.client.bodyOrThrow(
      "/api/comments",
      {
        method: "POST",
        token,
        body: input,
      },
      "Comment create failed."
    );
  }

  async deleteComment(token: string, commentId: number): Promise<void> {
    const response = await this.client.request(`/api/comments/${commentId}`, {
      method: "DELETE",
      token,
    });
    if (!response.ok) {
      await this.client.throwWithResponse(response, "Comment delete failed.");
    }
  }

  async getLikeCount(contentId: number, signal?: AbortSignal): Promise<number> {
    const body = await this.client.jsonOrThrow<LikeCountResponse>(
      `/api/contents/${contentId}/likes/count`,
      { signal },
      "Could not load likes."
    );
    return typeof body.count === "number" ? body.count : 0;
  }

  async isLikedByMe(token: string, contentId: number, signal?: AbortSignal): Promise<boolean> {
    const response = await this.client.request(`/api/contents/${contentId}/likes/me`, {
      token,
      signal,
    });

    if (response.status === 401 || response.status === 403) {
      return false;
    }
    if (!response.ok) {
      await this.client.throwWithResponse(response, `Could not load like status (${response.status}).`);
    }

    const body = (await response.json()) as LikeMeResponse;
    return body.liked === true;
  }

  async like(token: string, contentId: number): Promise<void> {
    const response = await this.client.request(`/api/contents/${contentId}/likes`, {
      method: "POST",
      token,
    });
    if (!response.ok) {
      await this.client.throwWithResponse(response, `Like request failed (${response.status}).`);
    }
  }

  async unlike(token: string, contentId: number): Promise<void> {
    const response = await this.client.request(`/api/contents/${contentId}/likes`, {
      method: "DELETE",
      token,
    });
    if (!response.ok && response.status !== 404) {
      await this.client.throwWithResponse(response, `Unlike request failed (${response.status}).`);
    }
  }

  async getEngagementSummary(contentId: number, token?: string | null, signal?: AbortSignal): Promise<EngagementSummary> {
    const [likes, comments, likedByMe] = await Promise.all([
      this.getLikeCount(contentId, signal),
      this.listComments(contentId, signal).then((items) => items.length),
      token ? this.isLikedByMe(token, contentId, signal) : Promise.resolve(false),
    ]);

    return {
      likes,
      comments,
      likedByMe,
    };
  }
}

const apiClient = new ApiClient();

export const contentPlatformService = new ContentPlatformService(apiClient);
