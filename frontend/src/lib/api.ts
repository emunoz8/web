export const apiBaseUrl = "";

export const apiUrl = (path: string): string => {
  return path.startsWith("/") ? path : `/${path}`;
};

export type PagedResponse<T> = {
  content: T[];
  number?: number;
  size?: number;
  totalPages?: number;
  totalElements?: number;
  numberOfElements?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
};

export type CategoryDomain = "PROJECT" | "BLOG";

export type CategoryItem = {
  id: number;
  domain: CategoryDomain;
  slug: string;
  label: string;
  createdAt: string;
};

export type ContentItem = {
  id: number;
  title: string;
  slug: string;
  createdAt: string;
  type: CategoryDomain;
  description?: string;
  bodyMd?: string;
  projectUrl?: string | null;
  engagement?: {
    likes: number;
    comments: number;
    likedByMe: boolean;
  };
};
