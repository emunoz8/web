import { useEffect, useState } from "react";
import ContentModal from "../components/common/ContentModal";
import { portfolioProfile } from "../features/portfolio/data/profile";
import { publishTerminalTelemetry } from "../features/terminalUI/lib/terminalTelemetry";
import { type ContentItem } from "../lib/api";
import { contentPlatformService } from "../lib/services/ContentPlatformService";

const ABOUT_BLOG_PAGE_SIZE = 3;

function getBlogExcerpt(item: ContentItem) {
  const source = item.bodyMd?.trim() || item.description?.trim() || "";
  if (!source) {
    return "This post is published from the backend content service and is available to read in full from the blog viewer.";
  }

  const cleaned = source
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/`{1,3}/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= 180) {
    return cleaned;
  }

  return `${cleaned.slice(0, 177)}...`;
}

function About() {
  const [blogPosts, setBlogPosts] = useState<ContentItem[]>([]);
  const [blogLoading, setBlogLoading] = useState(true);
  const [blogError, setBlogError] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<ContentItem | null>(null);
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [blogModalLoading, setBlogModalLoading] = useState(false);
  const [blogModalError, setBlogModalError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadBlogPosts() {
      try {
        setBlogLoading(true);
        setBlogError(null);
        publishTerminalTelemetry({
          tone: "info",
          lines: [`backend :: GET /api/contents?type=BLOG&page=0&size=${ABOUT_BLOG_PAGE_SIZE}`],
        });

        const page = await contentPlatformService.listContentsPage({
          type: "BLOG",
          page: 0,
          size: ABOUT_BLOG_PAGE_SIZE,
          signal: controller.signal,
        });

        if (!cancelled) {
          setBlogPosts(page.content);
          publishTerminalTelemetry({
            tone: "success",
            lines: [`backend :: loaded ${page.numberOfElements} latest blog entr${page.numberOfElements === 1 ? "y" : "ies"} for about page`],
          });
        }
      } catch (err) {
        if (!cancelled && (err as Error).name !== "AbortError") {
          setBlogError((err as Error).message);
          setBlogPosts([]);
          publishTerminalTelemetry({
            tone: "error",
            lines: [`backend :: about page blog load failed :: ${(err as Error).message}`],
          });
        }
      } finally {
        if (!cancelled) {
          setBlogLoading(false);
        }
      }
    }

    void loadBlogPosts();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const openBlogPost = async (item: ContentItem) => {
    setBlogModalOpen(true);
    setSelectedBlog(item);
    setBlogModalLoading(true);
    setBlogModalError(null);

    try {
      publishTerminalTelemetry({
        tone: "info",
        lines: [`backend :: GET /api/contents/id/${item.id}`],
      });
      const fullPost = await contentPlatformService.getContentById(item.id);
      setSelectedBlog(fullPost);
      publishTerminalTelemetry({
        tone: "success",
        lines: [`backend :: opened blog post :: ${fullPost.title}`],
      });
    } catch (err) {
      setBlogModalError((err as Error).message);
      publishTerminalTelemetry({
        tone: "error",
        lines: [`backend :: blog post open failed :: ${(err as Error).message}`],
      });
    } finally {
      setBlogModalLoading(false);
    }
  };

  const closeBlogModal = () => {
    setBlogModalOpen(false);
    setBlogModalLoading(false);
    setBlogModalError(null);
    setSelectedBlog(null);
  };

  return (
    <>
      <div className="space-y-16 py-8 sm:py-10">
        <section className="grid gap-10 border-b border-brand-line pb-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <div className="max-w-3xl">
            <p className="portfolio-kicker">About</p>
            <h1 className="portfolio-display-title mt-4">A bit about me</h1>
            <p className="mt-6 portfolio-copy-strong">
              {portfolioProfile.shortAbout[0]}
            </p>
            <p className="mt-4 portfolio-copy">
              {portfolioProfile.shortAbout[1]}
            </p>
          </div>

          <aside className="grid gap-4 lg:justify-self-end lg:max-w-sm">
            <div className="border-t border-brand-line pt-4">
              <p className="portfolio-kicker">Location</p>
              <p className="mt-2 portfolio-copy">{portfolioProfile.location}</p>
            </div>
            <div className="border-t border-brand-line pt-4">
              <p className="portfolio-kicker">Stack</p>
              <p className="mt-2 portfolio-copy">{portfolioProfile.techStackLine}</p>
            </div>
          </aside>
        </section>

        <section>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="portfolio-kicker">Writing</p>
              <h2 className="portfolio-display-title mt-3">Latest posts</h2>
            </div>
          </div>

          {blogLoading ? (
            <div className="mt-6 border-t border-brand-line/16 pt-6">
              <p className="portfolio-copy">Loading recent posts...</p>
            </div>
          ) : null}

          {!blogLoading && blogError ? (
            <div className="mt-6 border-t border-brand-line/16 pt-6">
              <p className="portfolio-copy">{`Could not load blog posts: ${blogError}`}</p>
            </div>
          ) : null}

          {!blogLoading && !blogError && blogPosts.length === 0 ? (
            <div className="mt-6 border-t border-brand-line/16 pt-6">
              <p className="portfolio-copy">No blog posts are published yet.</p>
            </div>
          ) : null}

          {!blogLoading && !blogError && blogPosts.length > 0 ? (
            <div className="mt-6 grid gap-x-8 gap-y-10 lg:grid-cols-2 xl:grid-cols-3">
              {blogPosts.map((post) => (
                <article key={post.id} className="flex h-full flex-col border-t border-brand-line/18 pt-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="portfolio-kicker">{new Date(post.createdAt).toLocaleDateString()}</p>
                      <h3 className="portfolio-display-subtitle mt-3">{post.title}</h3>
                    </div>
                    <p className="portfolio-kicker">Live from API</p>
                  </div>

                  <p className="mt-3 portfolio-copy">{`slug :: ${post.slug}`}</p>
                  <p className="mt-4 flex-1 portfolio-copy">{getBlogExcerpt(post)}</p>

                  <button
                    type="button"
                    onClick={() => void openBlogPost(post)}
                    className="portfolio-inline-link mt-5 inline-flex items-center"
                  >
                    Read post
                  </button>
                </article>
              ))}
            </div>
          ) : null}
        </section>

      </div>

      <ContentModal
        open={blogModalOpen}
        item={selectedBlog}
        loading={blogModalLoading}
        error={blogModalError}
        onClose={closeBlogModal}
      />
    </>
  );
}

export default About;
