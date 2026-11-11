import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import {
  getLocalContentById,
  getLocalContentBySlug,
  listLocalCategories,
  listLocalContents,
  listLocalContentsPage,
} from "../features/portfolio/data/localContent";
import {
  addLocalAuxTrack,
  getLocalAuxPlaylist,
  getLocalCurrentlyPlaying,
  searchLocalAuxTracks,
} from "../features/addToTheAux/data/localAuxData";
import ContentCard from "../components/content/ContentCard";
import BoardView from "../features/ticTacToe/components/BoardView";
import { encodeSpaRedirectUrl, restoreSpaPathFromSearch } from "../lib/spaPathRestore";
import { portfolioNavItems } from "../features/portfolio/data/profile";
import { publicRoutes } from "../routes/publicRoutes";
import { ThemeProvider, useTheme } from "../context/ThemeProvider";

describe("Frontend-only data layer, routing, SPA path restoration, and accessibility", () => {
  test("localContent provides static project and blog entries without network calls", () => {
    const projectCategories = listLocalCategories("PROJECT");
    const blogCategories = listLocalCategories("BLOG");
    expect(projectCategories.length).toBeGreaterThan(0);
    expect(blogCategories.length).toBeGreaterThan(0);

    const projects = listLocalContents({ type: "PROJECT" });
    expect(projects.length).toBe(6);
    expect(getLocalContentBySlug("tic-tac-toe-revisited")?.title).toContain("Tic Tac Toe");

    const blogsPage = listLocalContentsPage({ type: "BLOG", page: 0, size: 10 });
    expect(blogsPage.content.length).toBeGreaterThanOrEqual(3);
    const firstBlog = blogsPage.content[0];
    expect(getLocalContentById(firstBlog.id)?.slug).toBe(firstBlog.slug);
  });

  test("localAuxData supports searching and adding tracks locally", () => {
    const initialPlaylist = getLocalAuxPlaylist();
    expect(initialPlaylist.items.length).toBeGreaterThan(0);

    const current = getLocalCurrentlyPlaying();
    expect(current.playing).toBe(true);
    expect(current.trackId).toBe(initialPlaylist.items[0].id);

    const searchResults = searchLocalAuxTracks("Radiohead", 5);
    expect(searchResults.length).toBeGreaterThan(0);

    const candidate = searchLocalAuxTracks("Pretender", 5)[0];
    expect(candidate).toBeDefined();
    const result = addLocalAuxTrack(candidate);
    expect(result.added).toBe(true);
    expect(getLocalAuxPlaylist().items.some((track) => track.uri === candidate.uri)).toBe(true);

    const duplicateResult = addLocalAuxTrack(candidate);
    expect(duplicateResult.duplicate).toBe(true);
  });

  test("publicRoutes and portfolioNavItems align registered routes and exclude retired admin/auth/blog/contact routes", () => {
    const paths = publicRoutes.map((route) => route.to);
    expect(paths).toContain("/");
    expect(paths).toContain("/projects");
    expect(paths).toContain("/projects/:id");
    expect(paths).toContain("/about");
    expect(paths).not.toContain("/resume");
    expect(paths).not.toContain("/login");
    expect(paths).not.toContain("/api-lab");
    expect(paths).not.toContain("/admin/projects");
    expect(paths).not.toContain("/admin/blog");
    expect(paths).not.toContain("/blog");
    expect(paths).not.toContain("/contact");

    // Standard header navigation aligns with primary public routes with PDF access separate
    const navPaths = portfolioNavItems.map((item) => item.to);
    expect(navPaths).toEqual(["/", "/projects", "/about"]);
    const primaryPublicRoutePaths = publicRoutes.filter((r) => r.showInNav !== false).map((r) => r.to);
    expect(primaryPublicRoutePaths).toEqual(navPaths);
  });

  test("SPA path restoration preserves ordinary paths, queries, hashes, Unicode, %25, and encoded reserved characters without double decoding", () => {
    // Ordinary deep path
    const redirectSimple = encodeSpaRedirectUrl("/projects/jit-cafe");
    expect(restoreSpaPathFromSearch(redirectSimple.slice(1))).toBe("/projects/jit-cafe");

    // Path + query + hash combination
    const redirectCombo = encodeSpaRedirectUrl("/jit-cafe/menu", "?category=burgers&sort=price", "#featured");
    expect(restoreSpaPathFromSearch(redirectCombo.slice(1))).toBe(
      "/jit-cafe/menu?category=burgers&sort=price#featured",
    );

    // Unicode characters
    const redirectUnicode = encodeSpaRedirectUrl("/blog", "?author=Edwin%20Mu%C3%B1oz", "#secci%C3%B3n");
    expect(restoreSpaPathFromSearch(redirectUnicode.slice(1))).toBe(
      "/blog?author=Edwin%20Mu%C3%B1oz#secci%C3%B3n",
    );

    // Literal %25 and encoded reserved characters (%26, %3D, %23) must not throw or double-decode
    const redirectPercent = encodeSpaRedirectUrl(
      "/projects/tic-tac-toe-revisited",
      "?progress=100%25&filter=a%26b%3Dc",
      "#state%231",
    );
    expect(() => restoreSpaPathFromSearch(redirectPercent.slice(1))).not.toThrow();
    expect(restoreSpaPathFromSearch(redirectPercent.slice(1))).toBe(
      "/projects/tic-tac-toe-revisited?progress=100%25&filter=a%26b%3Dc#state%231",
    );

    // Extra outer query parameters are merged before the hash fragment
    const searchWithExtra = `${redirectCombo.slice(1)}&utm_source=github`;
    expect(restoreSpaPathFromSearch(searchWithExtra)).toBe(
      "/jit-cafe/menu?category=burgers&sort=price&utm_source=github#featured",
    );
  });

  test("ContentCard uses a keyboard-operable button without nesting the edit button", () => {
    const item = listLocalContents({ type: "BLOG" })[0];
    const onOpen = vi.fn();
    const onEdit = vi.fn();

    render(<ContentCard item={item} showEdit={true} onOpen={onOpen} onEdit={onEdit} />);

    const openButton = screen.getByRole("button", { name: `Open ${item.title}` });
    const editButton = screen.getByRole("button", { name: "Edit" });

    expect(openButton.contains(editButton)).toBe(false);

    fireEvent.click(openButton);
    expect(onOpen).toHaveBeenCalledWith(item);

    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledWith(item);
  });

  test("BoardView announces cell coordinates, marks, and playable states", () => {
    render(
      <BoardView
        board="XO......."
        onCellClick={() => undefined}
        playableIndices={new Set([2])}
      />,
    );

    expect(
      screen.getByRole("button", { name: /Cell 0, row 1 column 1, marked X/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Cell 1, row 1 column 2, marked O/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Cell 2, row 1 column 3, empty, playable/i }),
    ).not.toBeDisabled();
  });

  test("ThemeProvider initializes light mode and excludes dark class or terminal toggle", () => {
    function TestConsumer() {
      const { theme } = useTheme();
      return <div data-testid="theme-val">{theme}</div>;
    }

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme-val").textContent).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
