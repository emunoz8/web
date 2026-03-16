import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MarkdownRenderer from "../helpers/MarkdownRenderer";
import { ContentItem } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { CommentTreeNode, contentPlatformService } from "../../lib/services/ContentPlatformService";
import { buildLoginRouteState } from "../../lib/authRouting";

export interface ContentModalProps {
  open: boolean;
  item: ContentItem | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onEngagementChanged?: () => void;
}

function resolveProjectPresentation(projectUrl: string): {
  internalRoute: string | null;
  linkHref: string | null;
  iframeSrc: string | null;
} {
  const trimmed = projectUrl.trim();
  if (!trimmed) {
    return { internalRoute: null, linkHref: null, iframeSrc: null };
  }

  if (trimmed.startsWith("/")) {
    return { internalRoute: trimmed, linkHref: null, iframeSrc: null };
  }

  if (typeof window === "undefined") {
    return { internalRoute: null, linkHref: trimmed, iframeSrc: trimmed };
  }

  try {
    const resolved = new URL(trimmed, window.location.origin);
    const isHttp = resolved.protocol === "http:" || resolved.protocol === "https:";
    if (!isHttp) {
      return { internalRoute: null, linkHref: trimmed, iframeSrc: null };
    }

    const href = resolved.toString();
    const isSameOrigin = resolved.origin === window.location.origin;
    const internalRoute = isSameOrigin ? `${resolved.pathname}${resolved.search}${resolved.hash}` : null;
    return {
      internalRoute,
      linkHref: isSameOrigin ? null : href,
      iframeSrc: isSameOrigin ? null : href,
    };
  } catch {
    return { internalRoute: null, linkHref: trimmed, iframeSrc: null };
  }
}

const ContentModal: React.FC<ContentModalProps> = ({
  open,
  item,
  loading,
  error,
  onClose,
  onEngagementChanged,
}) => {
  const { username, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const contentId = item?.id ?? null;
  const projectUrl = item?.type === "PROJECT" ? item?.projectUrl?.trim() ?? "" : "";
  const { internalRoute: projectInternalRoute, linkHref: projectLinkHref, iframeSrc } =
    resolveProjectPresentation(projectUrl);

  const [likeCount, setLikeCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);
  const [likeActionLoading, setLikeActionLoading] = useState(false);
  const [likesError, setLikesError] = useState<string | null>(null);

  const [comments, setComments] = useState<CommentTreeNode[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [newCommentBody, setNewCommentBody] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replyParentId, setReplyParentId] = useState<number | null>(null);
  const [commentSubmitLoading, setCommentSubmitLoading] = useState(false);
  const [commentSubmitError, setCommentSubmitError] = useState<string | null>(null);
  const [commentDeleteLoadingId, setCommentDeleteLoadingId] = useState<number | null>(null);
  const [commentDeleteError, setCommentDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const loadLikes = useCallback(
    async (signal?: AbortSignal) => {
      if (contentId == null) {
        return;
      }

      try {
        setLikesLoading(true);
        setLikesError(null);
        const nextCount = await contentPlatformService.getLikeCount(contentId, signal);
        setLikeCount(nextCount);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setLikesError((err as Error).message);
        }
      } finally {
        setLikesLoading(false);
      }

      if (!isAuthenticated) {
        setLikedByMe(false);
        return;
      }

      try {
        const nextLiked = await contentPlatformService.isLikedByMe(contentId, signal);
        setLikedByMe(nextLiked);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setLikedByMe(false);
        }
      }
    },
    [contentId, isAuthenticated]
  );

  const loadComments = useCallback(
    async (signal?: AbortSignal) => {
      if (contentId == null) {
        return;
      }

      try {
        setCommentsLoading(true);
        setCommentsError(null);
        const body = await contentPlatformService.listCommentTree(contentId, signal);
        setComments(body);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setCommentsError((err as Error).message);
        }
      } finally {
        setCommentsLoading(false);
      }
    },
    [contentId]
  );

  useEffect(() => {
    if (!open || contentId == null) {
      return;
    }

    const controller = new AbortController();
    loadLikes(controller.signal);
    loadComments(controller.signal);
    return () => controller.abort();
  }, [open, contentId, loadLikes, loadComments]);

  useEffect(() => {
    if (!open) {
      setNewCommentBody("");
      setReplyBody("");
      setReplyParentId(null);
      setCommentSubmitError(null);
      setCommentDeleteError(null);
      setLikesError(null);
      setCommentsError(null);
    }
  }, [open]);

  const openLoginModal = useCallback(() => {
    navigate("/login", { state: buildLoginRouteState(location) });
  }, [location, navigate]);

  const toggleLike = async () => {
    if (contentId == null) {
      return;
    }
    if (!isAuthenticated) {
      setLikesError(null);
      openLoginModal();
      return;
    }

    try {
      setLikeActionLoading(true);
      setLikesError(null);
      if (likedByMe) {
        await contentPlatformService.unlike(contentId);
      } else {
        await contentPlatformService.like(contentId);
      }

      await loadLikes();
      onEngagementChanged?.();
    } catch (err) {
      setLikesError((err as Error).message);
    } finally {
      setLikeActionLoading(false);
    }
  };

  const postComment = async (bodyInput: string, parentId: number | null): Promise<void> => {
    if (contentId == null) {
      return;
    }
    if (!isAuthenticated) {
      setCommentSubmitError(null);
      openLoginModal();
      return;
    }

    const body = bodyInput.trim();
    if (!body) {
      setCommentSubmitError("Comment cannot be empty.");
      return;
    }

    try {
      setCommentSubmitLoading(true);
      setCommentSubmitError(null);
      await contentPlatformService.createComment({
        contentId,
        body,
        parentId,
      });

      setNewCommentBody("");
      setReplyBody("");
      setReplyParentId(null);
      await loadComments();
      onEngagementChanged?.();
    } catch (err) {
      setCommentSubmitError((err as Error).message);
    } finally {
      setCommentSubmitLoading(false);
    }
  };

  const submitNewComment = async (event: FormEvent) => {
    event.preventDefault();
    await postComment(newCommentBody, null);
  };

  const submitReplyComment = async (event: FormEvent, parentId: number) => {
    event.preventDefault();
    await postComment(replyBody, parentId);
  };

  const deleteComment = async (commentId: number) => {
    if (!isAuthenticated) {
      setCommentDeleteError(null);
      openLoginModal();
      return;
    }

    try {
      setCommentDeleteError(null);
      setCommentDeleteLoadingId(commentId);
      await contentPlatformService.deleteComment(commentId);

      await loadComments();
      onEngagementChanged?.();
    } catch (err) {
      setCommentDeleteError((err as Error).message);
    } finally {
      setCommentDeleteLoadingId(null);
    }
  };

  const canDeleteComment = (comment: CommentTreeNode): boolean => {
    if (!isAuthenticated) {
      return false;
    }
    if (isAdmin) {
      return true;
    }
    return username !== null && username === comment.username;
  };

  const renderComment = (comment: CommentTreeNode): React.ReactNode => {
    const hasChildren = Array.isArray(comment.children) && comment.children.length > 0;

    return (
      <li key={comment.id} className="border rounded-md p-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs opacity-80">
            <span className="font-semibold">{comment.username}</span> | {new Date(comment.createdAt).toLocaleString()}
          </p>
          <div className="flex flex-wrap gap-2">
            {isAuthenticated && (
              <button
                className="border rounded-md min-h-8 px-2 py-1 text-xs"
                type="button"
                onClick={() => {
                  setReplyParentId(comment.id);
                  setReplyBody("");
                  setCommentSubmitError(null);
                }}
              >
                Reply
              </button>
            )}
            {canDeleteComment(comment) && (
              <button
                className="border rounded-md min-h-8 px-2 py-1 text-xs"
                type="button"
                onClick={() => deleteComment(comment.id)}
                disabled={commentDeleteLoadingId === comment.id}
              >
                {commentDeleteLoadingId === comment.id ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>

        <p className="text-sm whitespace-pre-wrap">{comment.body}</p>

        {isAuthenticated && replyParentId === comment.id && (
          <form className="space-y-2 pt-1" onSubmit={(event) => submitReplyComment(event, comment.id)}>
            <div className="flex flex-wrap items-center gap-2 text-xs opacity-80">
              <span>Replying to {comment.username}</span>
              <button
                className="border rounded-md min-h-8 px-2 py-1"
                type="button"
                onClick={() => {
                  setReplyParentId(null);
                  setReplyBody("");
                  setCommentSubmitError(null);
                }}
              >
                Cancel Reply
              </button>
            </div>
            <textarea
              className="form-textarea min-h-20"
              placeholder="Write a reply..."
              value={replyBody}
              onChange={(event) => setReplyBody(event.target.value)}
            />
            {commentSubmitError && <p className="text-sm text-red-500">{commentSubmitError}</p>}
            <button className="border rounded-md min-h-11 px-3 py-2 text-sm" type="submit" disabled={commentSubmitLoading}>
              {commentSubmitLoading ? "Posting..." : "Post Reply"}
            </button>
          </form>
        )}

        {hasChildren && (
          <ul className="space-y-2 pl-3 sm:pl-4 border-l border-gray-300 dark:border-gray-700">
            {comment.children.map((child) => renderComment(child))}
          </ul>
        )}
      </li>
    );
  };

  if (!open) {
    return null;
  }

  const contentBody = item?.bodyMd ?? item?.description ?? "";

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/65 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-[84rem] max-h-[96vh] sm:max-h-[90vh] overflow-y-auto rounded-md sm:rounded-lg bg-white text-gray-900 dark:bg-gray-900 dark:text-green-300 border border-indigo-300 dark:border-emerald-400"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 sm:top-3 sm:right-3 min-h-10 px-3 py-1 rounded-md border border-gray-300 dark:border-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={onClose}
          aria-label="Close"
        >
          X
        </button>

        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-10">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">{item?.title ?? "Content"}</h2>
              {item && (
                <p className="text-xs sm:text-sm opacity-80 mt-1 break-all">
                  {item.type} | {item.slug} | {new Date(item.createdAt).toLocaleString()}
                </p>
              )}
            </div>
            {projectInternalRoute && (
              <button
                className="border rounded-md min-h-10 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                type="button"
                onClick={() => {
                  onClose();
                  navigate(projectInternalRoute);
                }}
              >
                Open Project
              </button>
            )}
            {!projectInternalRoute && projectLinkHref && (
              <a
                className="border rounded-md min-h-10 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                href={projectLinkHref}
                target="_blank"
                rel="noreferrer"
              >
                Open Project
              </a>
            )}
          </div>
        </div>

        <div className="p-1 sm:p-2">
          {!loading && !error && iframeSrc && (
            <div className="p-3 sm:p-4 md:p-6 space-y-3">
              <div className="rounded-xl border border-gray-300 dark:border-gray-700 overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-950">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-900">
                  <span className="h-3 w-3 rounded-full bg-red-400" aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden="true" />
                  <span className="ml-2 text-xs sm:text-sm opacity-80 truncate">{iframeSrc}</span>
                </div>
                <iframe
                  title={item?.title ?? "Project Window"}
                  src={iframeSrc}
                  className="block h-[70vh] min-h-[32rem] w-full bg-white"
                />
              </div>
            </div>
          )}
          {loading && <p className="p-3 sm:p-4">Loading content...</p>}
          {error && <p className="p-3 sm:p-4 text-red-500">Could not load content: {error}</p>}
          {!loading && !error && contentBody.trim() === "" && !iframeSrc && <p className="p-3 sm:p-4">No body content yet.</p>}
          {!loading && !error && contentBody.trim() !== "" && <MarkdownRenderer content={contentBody} />}
        </div>

        {contentId !== null && (
          <div className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6 pt-2 space-y-4 border-t border-gray-200 dark:border-gray-700">
            <section className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-sm sm:text-base">Likes: {likesLoading ? "Loading..." : likeCount}</p>
                <button
                  className="border rounded-md min-h-11 px-3 py-2 text-sm"
                  onClick={toggleLike}
                  disabled={likeActionLoading}
                  type="button"
                >
                  {!isAuthenticated ? "Login To Like" : likedByMe ? "Unlike" : "Like"}
                </button>
              </div>
              {likesError && <p className="text-sm text-red-500">{likesError}</p>}
            </section>

            <section className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold">Comments</h3>

              {isAuthenticated ? (
                <form className="space-y-2" onSubmit={submitNewComment}>
                  <textarea
                    className="form-textarea"
                    placeholder="Write a comment..."
                    value={newCommentBody}
                    onChange={(event) => setNewCommentBody(event.target.value)}
                  />
                  {replyParentId === null && commentSubmitError && (
                    <p className="text-sm text-red-500">{commentSubmitError}</p>
                  )}
                  <button className="border rounded-md min-h-11 px-3 py-2 text-sm" type="submit" disabled={commentSubmitLoading}>
                    {commentSubmitLoading ? "Posting..." : "Post Comment"}
                  </button>
                </form>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm opacity-80">Login to post comments and likes.</p>
                  <button className="border rounded-md min-h-11 px-3 py-2 text-sm" type="button" onClick={openLoginModal}>
                    Login
                  </button>
                </div>
              )}

              {commentDeleteError && <p className="text-sm text-red-500">{commentDeleteError}</p>}
              {commentsLoading && <p>Loading comments...</p>}
              {commentsError && <p className="text-sm text-red-500">Could not load comments: {commentsError}</p>}
              {!commentsLoading && !commentsError && comments.length === 0 && (
                <p className="text-sm opacity-80">No comments yet.</p>
              )}
              {!commentsLoading && !commentsError && comments.length > 0 && (
                <ul className="space-y-3">{comments.map((comment) => renderComment(comment))}</ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentModal;
