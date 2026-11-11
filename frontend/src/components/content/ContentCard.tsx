import React from "react";
import { ContentItem } from "../../lib/api";

type ContentCardProps = {
  item: ContentItem;
  likesDisplay?: string;
  commentsDisplay?: string;
  liked?: boolean;
  showEdit: boolean;
  onOpen: (item: ContentItem) => void | Promise<void>;
  onEdit?: (item: ContentItem) => void | Promise<void>;
};

const ContentCard: React.FC<ContentCardProps> = ({
  item,
  showEdit,
  onOpen,
  onEdit,
}) => {
  return (
    <li className="border rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          className="flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
          onClick={() => void onOpen(item)}
          aria-label={`Open ${item.title}`}
        >
          <h3 className="text-base sm:text-lg font-semibold leading-tight">{item.title}</h3>
          <p className="mt-1 text-xs sm:text-sm opacity-80">
            created: {new Date(item.createdAt).toLocaleDateString()}
          </p>
          {item.description ? (
            <p className="mt-2 text-xs sm:text-sm opacity-90">{item.description}</p>
          ) : null}
        </button>

        {showEdit && onEdit && (
          <button
            className="border rounded-md min-h-9 px-3 py-1 text-xs sm:text-sm shrink-0"
            onClick={() => void onEdit(item)}
            type="button"
          >
            Edit
          </button>
        )}
      </div>
    </li>
  );
};

export default ContentCard;
