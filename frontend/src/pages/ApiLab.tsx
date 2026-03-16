import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { apiBaseUrl, apiUrl, CategoryDomain, CategoryItem } from "../lib/api";
import { fetchWithCsrf } from "../lib/csrf";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type ApiLogEntry = {
  id: string;
  label: string;
  method: HttpMethod;
  path: string;
  status: number;
  durationMs: number;
  timestamp: string;
  requestBody?: string;
  responseBody: string;
};

type ApiCallOptions = {
  label: string;
  method: HttpMethod;
  path: string;
  body?: unknown;
  requiresAuth?: boolean;
};

type ApiCallResult = {
  status: number;
  parsed: unknown | undefined;
  responseBody: string;
};

type FormState = {
  authToken: string;
  registerUsername: string;
  registerEmail: string;
  registerPassword: string;
  loginUsername: string;
  loginPassword: string;
  verifyToken: string;
  resendEmail: string;
  resetLinkEmail: string;
  resetValidateToken: string;
  resetToken: string;
  resetNewPassword: string;
  listType: string;
  listCategory: string;
  listQuery: string;
  listPage: string;
  listSize: string;
  contentSlug: string;
  contentId: string;
  adminProjectTitle: string;
  adminProjectSlug: string;
  adminProjectDescription: string;
  adminProjectUpdateId: string;
  adminProjectUpdateTitle: string;
  adminProjectUpdateSlug: string;
  adminProjectUpdateDescription: string;
  adminProjectCategoryId: string;
  adminProjectNewCategoryLabel: string;
  adminProjectNewCategorySlug: string;
  adminBlogTitle: string;
  adminBlogSlug: string;
  adminBlogBody: string;
  adminBlogUpdateId: string;
  adminBlogUpdateTitle: string;
  adminBlogUpdateSlug: string;
  adminBlogUpdateBody: string;
  adminBlogCategoryId: string;
  adminBlogNewCategoryLabel: string;
  adminBlogNewCategorySlug: string;
  adminDeleteContentId: string;
  categoryListDomain: string;
  categoryCreateDomain: string;
  categoryCreateLabel: string;
  categoryCreateSlug: string;
  contentCategoryContentId: string;
  contentCategoryCategoryId: string;
  commentListContentId: string;
  commentTreeContentId: string;
  commentCreateContentId: string;
  commentBody: string;
  commentParentId: string;
  commentDeleteId: string;
  likeContentId: string;
  userCreateUsername: string;
  userCreateEmail: string;
  userCreatePassword: string;
  userGetId: string;
};

const initialFormState: FormState = {
  authToken: "",
  registerUsername: "",
  registerEmail: "",
  registerPassword: "",
  loginUsername: "",
  loginPassword: "",
  verifyToken: "",
  resendEmail: "",
  resetLinkEmail: "",
  resetValidateToken: "",
  resetToken: "",
  resetNewPassword: "",
  listType: "",
  listCategory: "",
  listQuery: "",
  listPage: "0",
  listSize: "20",
  contentSlug: "",
  contentId: "",
  adminProjectTitle: "",
  adminProjectSlug: "",
  adminProjectDescription: "",
  adminProjectUpdateId: "",
  adminProjectUpdateTitle: "",
  adminProjectUpdateSlug: "",
  adminProjectUpdateDescription: "",
  adminProjectCategoryId: "",
  adminProjectNewCategoryLabel: "",
  adminProjectNewCategorySlug: "",
  adminBlogTitle: "",
  adminBlogSlug: "",
  adminBlogBody: "",
  adminBlogUpdateId: "",
  adminBlogUpdateTitle: "",
  adminBlogUpdateSlug: "",
  adminBlogUpdateBody: "",
  adminBlogCategoryId: "",
  adminBlogNewCategoryLabel: "",
  adminBlogNewCategorySlug: "",
  adminDeleteContentId: "",
  categoryListDomain: "",
  categoryCreateDomain: "PROJECT",
  categoryCreateLabel: "",
  categoryCreateSlug: "",
  contentCategoryContentId: "",
  contentCategoryCategoryId: "",
  commentListContentId: "",
  commentTreeContentId: "",
  commentCreateContentId: "",
  commentBody: "",
  commentParentId: "",
  commentDeleteId: "",
  likeContentId: "",
  userCreateUsername: "",
  userCreateEmail: "",
  userCreatePassword: "",
  userGetId: "",
};

const inputClass = "form-input";
const textareaClass = "form-textarea";

const hasNumericId = (value: unknown): value is { id: number } => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("id" in value)) {
    return false;
  }
  return typeof value.id === "number";
};

const isCategoryItem = (value: unknown): value is CategoryItem => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const maybe = value as Partial<CategoryItem>;
  return (
    typeof maybe.id === "number" &&
    (maybe.domain === "PROJECT" || maybe.domain === "BLOG") &&
    typeof maybe.slug === "string" &&
    typeof maybe.label === "string"
  );
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

const serializeBody = (value: unknown): string => {
  if (value === undefined) {
    return "";
  }
  return JSON.stringify(value, null, 2);
};

const queryString = (params: Record<string, string | undefined>): string => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value.trim() === "") {
      continue;
    }
    search.set(key, value.trim());
  }

  const query = search.toString();
  return query ? `?${query}` : "";
};

const ApiLab: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [history, setHistory] = useState<ApiLogEntry[]>([]);
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const [projectCategoryOptions, setProjectCategoryOptions] = useState<CategoryItem[]>([]);
  const [blogCategoryOptions, setBlogCategoryOptions] = useState<CategoryItem[]>([]);
  const [adminCategoryLoading, setAdminCategoryLoading] = useState(false);
  const [adminCategoryError, setAdminCategoryError] = useState<string | null>(null);

  const displayedBase = useMemo(
    () => (apiBaseUrl ? apiBaseUrl : "(same origin / CRA proxy to http://localhost:8080)"),
    []
  );

  const setField =
    <K extends keyof FormState>(key: K) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const prependHistory = (entry: ApiLogEntry) => {
    setHistory((prev) => [entry, ...prev].slice(0, 30));
  };

  const appendLocalError = (label: string, path: string, message: string) => {
    prependHistory({
      id: `${Date.now()}-${Math.random()}`,
      label,
      method: "GET",
      path,
      status: 0,
      durationMs: 0,
      timestamp: new Date().toISOString(),
      responseBody: message,
    });
  };

  const runApiCall = async (options: ApiCallOptions): Promise<ApiCallResult> => {
    setPendingLabel(options.label);
    const startedAt = performance.now();
    const requestBody = options.body !== undefined ? serializeBody(options.body) : undefined;
    const headers: HeadersInit = {};
    const bearerToken = form.authToken.trim();

    if (requestBody !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (options.requiresAuth && bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`;
    }

    let status = 0;
    let responseBody = "";
    let parsed: unknown | undefined;

    try {
      const response = await fetchWithCsrf(apiUrl(options.path), {
        method: options.method,
        headers,
        body: requestBody,
      });
      status = response.status;

      const rawBody = await response.text();
      parsed = parseJsonSafe(rawBody);
      responseBody = parsed !== undefined ? JSON.stringify(parsed, null, 2) : rawBody || "(empty body)";
    } catch (err) {
      responseBody = (err as Error).message;
    } finally {
      const finishedAt = performance.now();
      prependHistory({
        id: `${Date.now()}-${Math.random()}`,
        label: options.label,
        method: options.method,
        path: options.path,
        status,
        durationMs: Math.round(finishedAt - startedAt),
        timestamp: new Date().toISOString(),
        requestBody,
        responseBody,
      });
      setPendingLabel(null);
    }

    return {
      status,
      parsed,
      responseBody,
    };
  };

  const loadAdminCategoryOptions = async () => {
    setAdminCategoryLoading(true);
    setAdminCategoryError(null);
    try {
      const [projectRes, blogRes] = await Promise.all([
        fetchWithCsrf(apiUrl("/api/categories?domain=PROJECT")),
        fetchWithCsrf(apiUrl("/api/categories?domain=BLOG")),
      ]);

      if (!projectRes.ok || !blogRes.ok) {
        throw new Error(`Could not load categories (${projectRes.status}/${blogRes.status})`);
      }

      const projectRaw = await projectRes.text();
      const blogRaw = await blogRes.text();
      const projectParsed = parseJsonSafe(projectRaw);
      const blogParsed = parseJsonSafe(blogRaw);

      const projectItems = Array.isArray(projectParsed) ? projectParsed.filter(isCategoryItem) : [];
      const blogItems = Array.isArray(blogParsed) ? blogParsed.filter(isCategoryItem) : [];

      setProjectCategoryOptions(projectItems);
      setBlogCategoryOptions(blogItems);
    } catch (err) {
      setAdminCategoryError((err as Error).message);
    } finally {
      setAdminCategoryLoading(false);
    }
  };

  useEffect(() => {
    loadAdminCategoryOptions();
  }, []);

  const createCategoryForDomain = async (
    domain: CategoryDomain,
    labelInput: string,
    slugInput: string
  ): Promise<number | null> => {
    const label = labelInput.trim();
    const slug = slugInput.trim();

    if (!label && !slug) {
      return null;
    }
    if (!label) {
      appendLocalError("POST /api/admin/categories", "/api/admin/categories", "Category label is required when creating a new category.");
      return null;
    }

    const result = await runApiCall({
      label: `POST /api/admin/categories (${domain})`,
      method: "POST",
      path: "/api/admin/categories",
      requiresAuth: true,
      body: {
        domain,
        label,
        slug,
      },
    });

    if (result.status < 200 || result.status >= 300 || !hasNumericId(result.parsed)) {
      return null;
    }

    await loadAdminCategoryOptions();
    return result.parsed.id;
  };

  const resolveCategoryId = async (
    domain: CategoryDomain,
    selectedCategoryId: string,
    newCategoryLabel: string,
    newCategorySlug: string
  ): Promise<number | null> => {
    const selected = selectedCategoryId.trim();
    if (selected) {
      const parsed = Number(selected);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
      appendLocalError("Category Selection", "/api/admin/categories", "Selected category id is invalid.");
      return null;
    }

    return createCategoryForDomain(domain, newCategoryLabel, newCategorySlug);
  };

  const openVerifyInTab = (mode: "verify" | "confirm-email") => {
    const token = form.verifyToken.trim();
    if (!token) {
      appendLocalError(`OPEN /api/auth/${mode}?token=...`, `/api/auth/${mode}`, "Token is required.");
      return;
    }
    const target = apiUrl(`/api/auth/${mode}?token=${encodeURIComponent(token)}`);
    window.open(target, "_blank", "noopener,noreferrer");
  };

  const submitRegister = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "POST /api/auth/register",
      method: "POST",
      path: "/api/auth/register",
      body: {
        username: form.registerUsername.trim(),
        email: form.registerEmail.trim(),
        password: form.registerPassword,
      },
    });
  };

  const submitLogin = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "POST /api/auth/login",
      method: "POST",
      path: "/api/auth/login",
      body: {
        username: form.loginUsername.trim(),
        password: form.loginPassword,
      },
    });
  };

  const submitResend = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "POST /api/auth/verify/resend",
      method: "POST",
      path: "/api/auth/verify/resend",
      body: { email: form.resendEmail.trim() },
    });
  };

  const submitResetLink = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "POST /api/auth/password/reset-link",
      method: "POST",
      path: "/api/auth/password/reset-link",
      body: { email: form.resetLinkEmail.trim() },
    });
  };

  const submitResetPassword = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "POST /api/auth/password/reset",
      method: "POST",
      path: "/api/auth/password/reset",
      body: { token: form.resetToken.trim(), newPassword: form.resetNewPassword },
    });
  };

  const submitContentsList = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "GET /api/contents",
      method: "GET",
      path: `/api/contents${queryString({
        type: form.listType,
        category: form.listCategory,
        q: form.listQuery,
        page: form.listPage,
        size: form.listSize,
      })}`,
    });
  };

  const submitGetBySlug = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "GET /api/contents/slug/{slug}",
      method: "GET",
      path: `/api/contents/slug/${encodeURIComponent(form.contentSlug.trim())}`,
    });
  };

  const submitGetById = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "GET /api/contents/id/{id}",
      method: "GET",
      path: `/api/contents/id/${encodeURIComponent(form.contentId.trim())}`,
    });
  };

  const submitCreateProject = async (event: FormEvent) => {
    event.preventDefault();
    const created = await runApiCall({
      label: "POST /api/admin/projects",
      method: "POST",
      path: "/api/admin/projects",
      requiresAuth: true,
      body: {
        title: form.adminProjectTitle.trim(),
        slug: form.adminProjectSlug.trim(),
        description: form.adminProjectDescription.trim(),
      },
    });

    if (created.status < 200 || created.status >= 300 || !hasNumericId(created.parsed)) {
      return;
    }

    const categoryId = await resolveCategoryId(
      "PROJECT",
      form.adminProjectCategoryId,
      form.adminProjectNewCategoryLabel,
      form.adminProjectNewCategorySlug
    );
    if (categoryId == null) {
      return;
    }

    await runApiCall({
      label: "POST /api/admin/contents/{contentId}/categories/{categoryId}",
      method: "POST",
      path: `/api/admin/contents/${created.parsed.id}/categories/${categoryId}`,
      requiresAuth: true,
    });
  };

  const submitUpdateProject = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "PUT /api/admin/projects/{id}",
      method: "PUT",
      path: `/api/admin/projects/${encodeURIComponent(form.adminProjectUpdateId.trim())}`,
      requiresAuth: true,
      body: {
        title: form.adminProjectUpdateTitle.trim(),
        slug: form.adminProjectUpdateSlug.trim(),
        description: form.adminProjectUpdateDescription.trim(),
      },
    });
  };

  const submitCreateBlog = async (event: FormEvent) => {
    event.preventDefault();
    const created = await runApiCall({
      label: "POST /api/admin/blogs",
      method: "POST",
      path: "/api/admin/blogs",
      requiresAuth: true,
      body: {
        title: form.adminBlogTitle.trim(),
        slug: form.adminBlogSlug.trim(),
        bodyMd: form.adminBlogBody,
      },
    });

    if (created.status < 200 || created.status >= 300 || !hasNumericId(created.parsed)) {
      return;
    }

    const categoryId = await resolveCategoryId(
      "BLOG",
      form.adminBlogCategoryId,
      form.adminBlogNewCategoryLabel,
      form.adminBlogNewCategorySlug
    );
    if (categoryId == null) {
      return;
    }

    await runApiCall({
      label: "POST /api/admin/contents/{contentId}/categories/{categoryId}",
      method: "POST",
      path: `/api/admin/contents/${created.parsed.id}/categories/${categoryId}`,
      requiresAuth: true,
    });
  };

  const submitUpdateBlog = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "PUT /api/admin/blogs/{id}",
      method: "PUT",
      path: `/api/admin/blogs/${encodeURIComponent(form.adminBlogUpdateId.trim())}`,
      requiresAuth: true,
      body: {
        title: form.adminBlogUpdateTitle.trim(),
        slug: form.adminBlogUpdateSlug.trim(),
        bodyMd: form.adminBlogUpdateBody,
      },
    });
  };

  const submitDeleteContent = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "DELETE /api/admin/contents/{id}",
      method: "DELETE",
      path: `/api/admin/contents/${encodeURIComponent(form.adminDeleteContentId.trim())}`,
      requiresAuth: true,
    });
  };

  const runListCategories = () =>
    runApiCall({
      label: "GET /api/categories",
      method: "GET",
      path: `/api/categories${queryString({ domain: form.categoryListDomain })}`,
    });

  const submitCreateCategory = async (event: FormEvent) => {
    event.preventDefault();
    const result = await runApiCall({
      label: "POST /api/admin/categories",
      method: "POST",
      path: "/api/admin/categories",
      requiresAuth: true,
      body: {
        domain: form.categoryCreateDomain,
        label: form.categoryCreateLabel.trim(),
        slug: form.categoryCreateSlug.trim(),
      },
    });

    if (result.status >= 200 && result.status < 300) {
      await loadAdminCategoryOptions();
    }
  };

  const runAttachCategory = () =>
    runApiCall({
      label: "POST /api/admin/contents/{contentId}/categories/{categoryId}",
      method: "POST",
      path: `/api/admin/contents/${encodeURIComponent(
        form.contentCategoryContentId.trim()
      )}/categories/${encodeURIComponent(form.contentCategoryCategoryId.trim())}`,
      requiresAuth: true,
    });

  const runDetachCategory = () =>
    runApiCall({
      label: "DELETE /api/admin/contents/{contentId}/categories/{categoryId}",
      method: "DELETE",
      path: `/api/admin/contents/${encodeURIComponent(
        form.contentCategoryContentId.trim()
      )}/categories/${encodeURIComponent(form.contentCategoryCategoryId.trim())}`,
      requiresAuth: true,
    });

  const submitListComments = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "GET /api/comments?contentId",
      method: "GET",
      path: `/api/comments${queryString({ contentId: form.commentListContentId })}`,
    });
  };

  const submitTreeComments = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "GET /api/comments/tree?contentId",
      method: "GET",
      path: `/api/comments/tree${queryString({ contentId: form.commentTreeContentId })}`,
    });
  };

  const submitCreateComment = (event: FormEvent) => {
    event.preventDefault();
    const contentId = Number(form.commentCreateContentId.trim());
    const parentIdRaw = form.commentParentId.trim();

    runApiCall({
      label: "POST /api/comments",
      method: "POST",
      path: "/api/comments",
      requiresAuth: true,
      body: {
        contentId,
        body: form.commentBody,
        parentId: parentIdRaw === "" ? null : Number(parentIdRaw),
      },
    });
  };

  const submitDeleteComment = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "DELETE /api/comments/{id}",
      method: "DELETE",
      path: `/api/comments/${encodeURIComponent(form.commentDeleteId.trim())}`,
      requiresAuth: true,
    });
  };

  const submitUserCreate = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "POST /api/users",
      method: "POST",
      path: "/api/users",
      requiresAuth: true,
      body: {
        username: form.userCreateUsername.trim(),
        email: form.userCreateEmail.trim(),
        password: form.userCreatePassword,
      },
    });
  };

  const submitUserGet = (event: FormEvent) => {
    event.preventDefault();
    runApiCall({
      label: "GET /api/users/{id}",
      method: "GET",
      path: `/api/users/${encodeURIComponent(form.userGetId.trim())}`,
      requiresAuth: true,
    });
  };

  const runLikePost = () =>
    runApiCall({
      label: "POST /api/contents/{id}/likes",
      method: "POST",
      path: `/api/contents/${encodeURIComponent(form.likeContentId.trim())}/likes`,
      requiresAuth: true,
    });

  const runLikeDelete = () =>
    runApiCall({
      label: "DELETE /api/contents/{id}/likes",
      method: "DELETE",
      path: `/api/contents/${encodeURIComponent(form.likeContentId.trim())}/likes`,
      requiresAuth: true,
    });

  const runLikeMe = () =>
    runApiCall({
      label: "GET /api/contents/{id}/likes/me",
      method: "GET",
      path: `/api/contents/${encodeURIComponent(form.likeContentId.trim())}/likes/me`,
      requiresAuth: true,
    });

  const runLikeCount = () =>
    runApiCall({
      label: "GET /api/contents/{id}/likes/count",
      method: "GET",
      path: `/api/contents/${encodeURIComponent(form.likeContentId.trim())}/likes/count`,
    });

  return (
    <section className="p-3 sm:p-4 md:p-8 space-y-5 sm:space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">API Lab</h1>
        <p className="text-sm opacity-80">
          Full local test console for your backend endpoints. Base URL: <code>{displayedBase}</code>
        </p>
        <p className="text-sm opacity-80">
          Browser requests now use the session cookie automatically. Paste a bearer token only if you want to test header-based auth manually.
        </p>
      </header>

      <section className="border rounded-md p-4 space-y-3">
        <h2 className="font-semibold">Session</h2>
        <p className="text-sm opacity-80">
          Authenticated calls use <code>credentials: "include"</code>. The bearer token field below is optional and only overrides requests that
          mark <code>requiresAuth</code>.
        </p>
        <div className="flex flex-col gap-2">
          <label htmlFor="authToken">Bearer Token</label>
          <textarea
            id="authToken"
            className={textareaClass}
            value={form.authToken}
            onChange={setField("authToken")}
            placeholder="Optional: paste JWT here for manual Authorization header testing"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={() => runApiCall({ label: "GET /actuator/health", method: "GET", path: "/actuator/health" })}>
            Health
          </button>
          <button className="btn" onClick={() => runApiCall({ label: "GET /actuator/info", method: "GET", path: "/actuator/info" })}>
            Info
          </button>
          <button className="btn" onClick={() => runApiCall({ label: "GET /api/auth/login", method: "GET", path: "/api/auth/login" })}>
            Auth Hint
          </button>
          <button className="btn" onClick={() => runApiCall({ label: "GET /api/auth/session", method: "GET", path: "/api/auth/session", requiresAuth: true })}>
            Session
          </button>
          <button className="btn" onClick={() => runApiCall({ label: "POST /api/auth/logout", method: "POST", path: "/api/auth/logout", requiresAuth: true })}>
            Logout
          </button>
          <button className="btn" onClick={() => setHistory([])}>
            Clear History
          </button>
          <button className="btn" onClick={() => setForm((prev) => ({ ...prev, authToken: "" }))}>
            Clear Token
          </button>
        </div>
      </section>

      <details open className="border rounded-md p-4 space-y-3">
        <summary className="font-semibold cursor-pointer">Auth Endpoints</summary>

        <form className="space-y-2" onSubmit={submitRegister}>
          <h3 className="font-medium">POST /api/auth/register</h3>
          <div className="grid md:grid-cols-3 gap-2">
            <input className={inputClass} placeholder="username" value={form.registerUsername} onChange={setField("registerUsername")} />
            <input className={inputClass} placeholder="email" value={form.registerEmail} onChange={setField("registerEmail")} />
            <input className={inputClass} type="password" placeholder="password" value={form.registerPassword} onChange={setField("registerPassword")} />
          </div>
          <button className="btn" type="submit">
            Register
          </button>
        </form>

        <form className="space-y-2" onSubmit={submitLogin}>
          <h3 className="font-medium">POST /api/auth/login (sets session cookie)</h3>
          <div className="grid md:grid-cols-2 gap-2">
            <input className={inputClass} placeholder="username" value={form.loginUsername} onChange={setField("loginUsername")} />
            <input className={inputClass} type="password" placeholder="password" value={form.loginPassword} onChange={setField("loginPassword")} />
          </div>
          <button className="btn" type="submit">
            Login
          </button>
        </form>

        <div className="space-y-2">
          <h3 className="font-medium">GET /api/auth/verify and /api/auth/confirm-email (redirect flow)</h3>
          <input className={inputClass} placeholder="verification token" value={form.verifyToken} onChange={setField("verifyToken")} />
          <div className="flex flex-wrap gap-2">
            <button className="btn" onClick={() => openVerifyInTab("verify")}>
              Open /api/auth/verify
            </button>
            <button className="btn" onClick={() => openVerifyInTab("confirm-email")}>
              Open /api/auth/confirm-email
            </button>
          </div>
        </div>

        <form className="space-y-2" onSubmit={submitResend}>
          <h3 className="font-medium">POST /api/auth/verify/resend</h3>
          <input className={inputClass} placeholder="email" value={form.resendEmail} onChange={setField("resendEmail")} />
          <button className="btn" type="submit">
            Resend Verification
          </button>
        </form>

        <form className="space-y-2" onSubmit={submitResetLink}>
          <h3 className="font-medium">POST /api/auth/password/reset-link</h3>
          <input className={inputClass} placeholder="email" value={form.resetLinkEmail} onChange={setField("resetLinkEmail")} />
          <button className="btn" type="submit">
            Request Reset Link
          </button>
        </form>

        <div className="space-y-2">
          <h3 className="font-medium">GET /api/auth/password/validate?token=...</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              className={inputClass}
              placeholder="reset token"
              value={form.resetValidateToken}
              onChange={setField("resetValidateToken")}
            />
            <button
              className="btn"
              onClick={() =>
                runApiCall({
                  label: "GET /api/auth/password/validate",
                  method: "GET",
                  path: `/api/auth/password/validate${queryString({ token: form.resetValidateToken })}`,
                })
              }
            >
              Validate Token
            </button>
          </div>
        </div>

        <form className="space-y-2" onSubmit={submitResetPassword}>
          <h3 className="font-medium">POST /api/auth/password/reset</h3>
          <div className="grid md:grid-cols-2 gap-2">
            <input className={inputClass} placeholder="reset token" value={form.resetToken} onChange={setField("resetToken")} />
            <input
              className={inputClass}
              type="password"
              placeholder="new password"
              value={form.resetNewPassword}
              onChange={setField("resetNewPassword")}
            />
          </div>
          <button className="btn" type="submit">
            Reset Password
          </button>
        </form>
      </details>

      <details open className="border rounded-md p-4 space-y-3">
        <summary className="font-semibold cursor-pointer">Content Endpoints</summary>

        <form className="space-y-2" onSubmit={submitContentsList}>
          <h3 className="font-medium">GET /api/contents</h3>
          <div className="grid md:grid-cols-5 gap-2">
            <select className={inputClass} value={form.listType} onChange={setField("listType")}>
              <option value="">(any type)</option>
              <option value="PROJECT">PROJECT</option>
              <option value="BLOG">BLOG</option>
            </select>
            <input className={inputClass} placeholder="category slug" value={form.listCategory} onChange={setField("listCategory")} />
            <input className={inputClass} placeholder="q (search)" value={form.listQuery} onChange={setField("listQuery")} />
            <input className={inputClass} placeholder="page" value={form.listPage} onChange={setField("listPage")} />
            <input className={inputClass} placeholder="size" value={form.listSize} onChange={setField("listSize")} />
          </div>
          <button className="btn" type="submit">
            Fetch Contents
          </button>
        </form>

        <form className="space-y-2" onSubmit={submitGetBySlug}>
          <h3 className="font-medium">GET /api/contents/slug/{`{slug}`}</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <input className={inputClass} placeholder="slug" value={form.contentSlug} onChange={setField("contentSlug")} />
            <button className="btn" type="submit">
              Fetch by Slug
            </button>
          </div>
        </form>

        <form className="space-y-2" onSubmit={submitGetById}>
          <h3 className="font-medium">GET /api/contents/id/{`{id}`}</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <input className={inputClass} placeholder="id" value={form.contentId} onChange={setField("contentId")} />
            <button className="btn" type="submit">
              Fetch by ID
            </button>
          </div>
        </form>
      </details>

      <details open className="border rounded-md p-4 space-y-3">
        <summary className="font-semibold cursor-pointer">Category Endpoints</summary>

        <div className="space-y-2">
          <h3 className="font-medium">GET /api/categories</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <select className={inputClass} value={form.categoryListDomain} onChange={setField("categoryListDomain")}>
              <option value="">(all domains)</option>
              <option value="PROJECT">PROJECT</option>
              <option value="BLOG">BLOG</option>
            </select>
            <button className="btn" onClick={runListCategories}>
              List Categories
            </button>
          </div>
        </div>

        <form className="space-y-2" onSubmit={submitCreateCategory}>
          <h3 className="font-medium">POST /api/admin/categories (requires ADMIN)</h3>
          <div className="grid md:grid-cols-3 gap-2">
            <select className={inputClass} value={form.categoryCreateDomain} onChange={setField("categoryCreateDomain")}>
              <option value="PROJECT">PROJECT</option>
              <option value="BLOG">BLOG</option>
            </select>
            <input className={inputClass} placeholder="label (e.g. Java)" value={form.categoryCreateLabel} onChange={setField("categoryCreateLabel")} />
            <input className={inputClass} placeholder="slug optional (e.g. java)" value={form.categoryCreateSlug} onChange={setField("categoryCreateSlug")} />
          </div>
          <button className="btn" type="submit">
            Create Category
          </button>
        </form>

        <div className="space-y-2">
          <h3 className="font-medium">Attach/Detach Category To Content (requires ADMIN)</h3>
          <div className="grid md:grid-cols-2 gap-2">
            <input
              className={inputClass}
              placeholder="contentId"
              value={form.contentCategoryContentId}
              onChange={setField("contentCategoryContentId")}
            />
            <input
              className={inputClass}
              placeholder="categoryId"
              value={form.contentCategoryCategoryId}
              onChange={setField("contentCategoryCategoryId")}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn" onClick={runAttachCategory}>
              POST attach category
            </button>
            <button className="btn" onClick={runDetachCategory}>
              DELETE detach category
            </button>
          </div>
        </div>
      </details>

      <details open className="border rounded-md p-4 space-y-3">
        <summary className="font-semibold cursor-pointer">Comment Endpoints</summary>

        <form className="space-y-2" onSubmit={submitListComments}>
          <h3 className="font-medium">GET /api/comments?contentId=...</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              className={inputClass}
              placeholder="contentId"
              value={form.commentListContentId}
              onChange={setField("commentListContentId")}
            />
            <button className="btn" type="submit">
              List Comments
            </button>
          </div>
        </form>

        <form className="space-y-2" onSubmit={submitTreeComments}>
          <h3 className="font-medium">GET /api/comments/tree?contentId=...</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              className={inputClass}
              placeholder="contentId"
              value={form.commentTreeContentId}
              onChange={setField("commentTreeContentId")}
            />
            <button className="btn" type="submit">
              Tree View
            </button>
          </div>
        </form>

        <form className="space-y-2" onSubmit={submitCreateComment}>
          <h3 className="font-medium">POST /api/comments (requires auth)</h3>
          <div className="grid md:grid-cols-3 gap-2">
            <input
              className={inputClass}
              placeholder="contentId"
              value={form.commentCreateContentId}
              onChange={setField("commentCreateContentId")}
            />
            <input
              className={inputClass}
              placeholder="parentId (optional)"
              value={form.commentParentId}
              onChange={setField("commentParentId")}
            />
            <input className={inputClass} placeholder="body" value={form.commentBody} onChange={setField("commentBody")} />
          </div>
          <button className="btn" type="submit">
            Add Comment
          </button>
        </form>

        <form className="space-y-2" onSubmit={submitDeleteComment}>
          <h3 className="font-medium">DELETE /api/comments/{`{id}`}</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <input className={inputClass} placeholder="comment id" value={form.commentDeleteId} onChange={setField("commentDeleteId")} />
            <button className="btn" type="submit">
              Delete Comment
            </button>
          </div>
        </form>
      </details>

      <details open className="border rounded-md p-4 space-y-3">
        <summary className="font-semibold cursor-pointer">Like Endpoints</summary>

        <div className="space-y-2">
          <input className={inputClass} placeholder="contentId" value={form.likeContentId} onChange={setField("likeContentId")} />
          <div className="flex flex-wrap gap-2">
            <button className="btn" onClick={runLikeCount}>
              GET /likes/count
            </button>
            <button className="btn" onClick={runLikeMe}>
              GET /likes/me
            </button>
            <button className="btn" onClick={runLikePost}>
              POST /likes
            </button>
            <button className="btn" onClick={runLikeDelete}>
              DELETE /likes
            </button>
          </div>
        </div>
      </details>

      <details open className="border rounded-md p-4 space-y-3">
        <summary className="font-semibold cursor-pointer">User Endpoints</summary>

        <form className="space-y-2" onSubmit={submitUserCreate}>
          <h3 className="font-medium">POST /api/users (requires auth)</h3>
          <div className="grid md:grid-cols-3 gap-2">
            <input className={inputClass} placeholder="username" value={form.userCreateUsername} onChange={setField("userCreateUsername")} />
            <input className={inputClass} placeholder="email" value={form.userCreateEmail} onChange={setField("userCreateEmail")} />
            <input
              className={inputClass}
              type="password"
              placeholder="password"
              value={form.userCreatePassword}
              onChange={setField("userCreatePassword")}
            />
          </div>
          <button className="btn" type="submit">
            Create User
          </button>
        </form>

        <form className="space-y-2" onSubmit={submitUserGet}>
          <h3 className="font-medium">GET /api/users/{`{id}`}</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <input className={inputClass} placeholder="user id" value={form.userGetId} onChange={setField("userGetId")} />
            <button className="btn" type="submit">
              Get User
            </button>
          </div>
        </form>
      </details>

      <details open className="border rounded-md p-4 space-y-3">
        <summary className="font-semibold cursor-pointer">Admin Endpoints (requires ADMIN session or bearer token)</summary>

        <div className="space-y-2">
          <h3 className="font-medium">Category Options For Create Forms</h3>
          {adminCategoryLoading && <p className="text-sm opacity-80">Loading admin category options...</p>}
          {adminCategoryError && <p className="text-sm text-red-500">Could not load category options: {adminCategoryError}</p>}
          <button className="btn" onClick={loadAdminCategoryOptions}>
            Refresh Category Options
          </button>
        </div>

        <form className="space-y-2" onSubmit={submitCreateProject}>
          <h3 className="font-medium">POST /api/admin/projects + optional category attach</h3>
          <div className="grid md:grid-cols-3 gap-2">
            <input
              className={inputClass}
              placeholder="title"
              value={form.adminProjectTitle}
              onChange={setField("adminProjectTitle")}
            />
            <input className={inputClass} placeholder="slug" value={form.adminProjectSlug} onChange={setField("adminProjectSlug")} />
            <input
              className={inputClass}
              placeholder="description"
              value={form.adminProjectDescription}
              onChange={setField("adminProjectDescription")}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-2">
            <select className={inputClass} value={form.adminProjectCategoryId} onChange={setField("adminProjectCategoryId")}>
              <option value="">(no existing category selected)</option>
              {projectCategoryOptions.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.label} ({category.slug})
                </option>
              ))}
            </select>
            <input
              className={inputClass}
              placeholder="new category label (optional)"
              value={form.adminProjectNewCategoryLabel}
              onChange={setField("adminProjectNewCategoryLabel")}
            />
            <input
              className={inputClass}
              placeholder="new category slug optional"
              value={form.adminProjectNewCategorySlug}
              onChange={setField("adminProjectNewCategorySlug")}
            />
          </div>
          {projectCategoryOptions.length === 0 && (
            <p className="text-sm opacity-80">No project categories found. Enter a new category label to create one on submit.</p>
          )}
          <button className="btn" type="submit">
            Create Project
          </button>
        </form>

        <form className="space-y-2" onSubmit={submitUpdateProject}>
          <h3 className="font-medium">PUT /api/admin/projects/{`{id}`}</h3>
          <div className="grid md:grid-cols-4 gap-2">
            <input
              className={inputClass}
              placeholder="project id"
              value={form.adminProjectUpdateId}
              onChange={setField("adminProjectUpdateId")}
            />
            <input
              className={inputClass}
              placeholder="title (optional)"
              value={form.adminProjectUpdateTitle}
              onChange={setField("adminProjectUpdateTitle")}
            />
            <input
              className={inputClass}
              placeholder="slug (optional)"
              value={form.adminProjectUpdateSlug}
              onChange={setField("adminProjectUpdateSlug")}
            />
            <input
              className={inputClass}
              placeholder="description (optional)"
              value={form.adminProjectUpdateDescription}
              onChange={setField("adminProjectUpdateDescription")}
            />
          </div>
          <button className="btn" type="submit">
            Update Project
          </button>
        </form>

        <form className="space-y-2" onSubmit={submitCreateBlog}>
          <h3 className="font-medium">POST /api/admin/blogs + optional category attach</h3>
          <div className="grid md:grid-cols-2 gap-2">
            <input className={inputClass} placeholder="title" value={form.adminBlogTitle} onChange={setField("adminBlogTitle")} />
            <input className={inputClass} placeholder="slug" value={form.adminBlogSlug} onChange={setField("adminBlogSlug")} />
          </div>
          <textarea className={textareaClass} placeholder="bodyMd" value={form.adminBlogBody} onChange={setField("adminBlogBody")} />
          <div className="grid md:grid-cols-3 gap-2">
            <select className={inputClass} value={form.adminBlogCategoryId} onChange={setField("adminBlogCategoryId")}>
              <option value="">(no existing category selected)</option>
              {blogCategoryOptions.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.label} ({category.slug})
                </option>
              ))}
            </select>
            <input
              className={inputClass}
              placeholder="new category label (optional)"
              value={form.adminBlogNewCategoryLabel}
              onChange={setField("adminBlogNewCategoryLabel")}
            />
            <input
              className={inputClass}
              placeholder="new category slug optional"
              value={form.adminBlogNewCategorySlug}
              onChange={setField("adminBlogNewCategorySlug")}
            />
          </div>
          {blogCategoryOptions.length === 0 && (
            <p className="text-sm opacity-80">No blog categories found. Enter a new category label to create one on submit.</p>
          )}
          <button className="btn" type="submit">
            Create Blog
          </button>
        </form>

        <form className="space-y-2" onSubmit={submitUpdateBlog}>
          <h3 className="font-medium">PUT /api/admin/blogs/{`{id}`}</h3>
          <div className="grid md:grid-cols-3 gap-2">
            <input
              className={inputClass}
              placeholder="blog id"
              value={form.adminBlogUpdateId}
              onChange={setField("adminBlogUpdateId")}
            />
            <input
              className={inputClass}
              placeholder="title (optional)"
              value={form.adminBlogUpdateTitle}
              onChange={setField("adminBlogUpdateTitle")}
            />
            <input
              className={inputClass}
              placeholder="slug (optional)"
              value={form.adminBlogUpdateSlug}
              onChange={setField("adminBlogUpdateSlug")}
            />
          </div>
          <textarea
            className={textareaClass}
            placeholder="bodyMd (optional)"
            value={form.adminBlogUpdateBody}
            onChange={setField("adminBlogUpdateBody")}
          />
          <button className="btn" type="submit">
            Update Blog
          </button>
        </form>

        <form className="space-y-2" onSubmit={submitDeleteContent}>
          <h3 className="font-medium">DELETE /api/admin/contents/{`{id}`}</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              className={inputClass}
              placeholder="content id"
              value={form.adminDeleteContentId}
              onChange={setField("adminDeleteContentId")}
            />
            <button className="btn" type="submit">
              Delete Content
            </button>
          </div>
        </form>
      </details>

      <section className="border rounded-md p-4 space-y-2">
        <h2 className="font-semibold">Request History</h2>
        {pendingLabel && <p className="text-sm opacity-80">Running: {pendingLabel}</p>}

        {history.length === 0 && <p className="text-sm opacity-80">No requests yet.</p>}

        {history.map((entry) => (
          <details key={entry.id} className="border rounded p-3">
            <summary className="cursor-pointer">
              <span className="font-semibold">{entry.label}</span> | status {entry.status} | {entry.durationMs} ms
            </summary>
            <p className="text-xs mt-2 opacity-80">
              {entry.timestamp} | {entry.method} {entry.path}
            </p>
            {entry.requestBody && (
              <div className="mt-2">
                <p className="text-xs font-semibold">Request body</p>
                <pre className="overflow-x-auto text-xs">{entry.requestBody}</pre>
              </div>
            )}
            <div className="mt-2">
              <p className="text-xs font-semibold">Response body</p>
              <pre className="overflow-x-auto text-xs">{entry.responseBody}</pre>
            </div>
          </details>
        ))}
      </section>
    </section>
  );
};

export default ApiLab;
