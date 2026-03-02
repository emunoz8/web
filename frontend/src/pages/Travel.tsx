import React, { useEffect, useState } from "react";
import { apiUrl, ContentItem, PagedResponse } from "../lib/api";

const Travel: React.FC = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(apiUrl("/api/contents?type=PROJECT&q=travel&page=0&size=20"), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const body = (await response.json()) as PagedResponse<ContentItem>;
        setItems(body.content ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  return (
    <section className="p-3 sm:p-4 md:p-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Travel</h1>
      <p className="mb-4 text-sm opacity-80">
        Long-term space for travel posts/projects. Right now this filters project content by `q=travel`.
      </p>

      {loading && <p>Loading travel content...</p>}
      {error && <p className="text-red-500">Could not load travel content: {error}</p>}

      {!loading && !error && items.length === 0 && (
        <p>No travel entries found yet. Add project content with travel-related titles.</p>
      )}

      <ul className="space-y-2 sm:space-y-3">
        {items.map((item) => (
          <li key={item.id} className="border rounded-lg p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold">{item.title}</h2>
            <p className="text-xs sm:text-sm opacity-80 break-all">slug: {item.slug}</p>
            <p className="text-xs sm:text-sm opacity-80">created: {new Date(item.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Travel;
