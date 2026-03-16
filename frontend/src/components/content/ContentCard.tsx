import React from "react";
import { HiHeart, HiOutlineHeart } from "react-icons/hi2";
import { ContentItem } from "../../lib/api";

type ContentCardProps = {
  item: ContentItem;
  likesDisplay: string;
  commentsDisplay: string;
  liked: boolean;
  showEdit: boolean;
  onOpen: (item: ContentItem) => void | Promise<void>;
  onEdit?: (item: ContentItem) => void | Promise<void>;
};

const ContentCard: React.FC<ContentCardProps> = ({
  item,
  likesDisplay,
  commentsDisplay,
  liked,
  showEdit,
  onOpen,
  onEdit,
}) => {
  return (
    <li
      className="border rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      onClick={() => onOpen(item)}
    >
      <div className="flex items-start sm:items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg font-semibold leading-tight">{item.title}</h3>
        {showEdit && onEdit && (
          <button
            className="border rounded-md min-h-9 px-3 py-1 text-xs sm:text-sm"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(item);
            }}
            type="button"
          >
            Edit
          </button>
        )}
      </div>

      <p className="text-xs sm:text-sm opacity-80">created: {new Date(item.createdAt).toLocaleDateString()}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm opacity-90">
        <span className="inline-flex items-center gap-1">
          {liked ? (
            <HiHeart className="h-4 w-4 text-red-500" aria-hidden="true" />
          ) : (
            <HiOutlineHeart className="h-4 w-4" aria-hidden="true" />
          )}
          <span>{likesDisplay}</span>
        </span>
        <span>Comments: {commentsDisplay}</span>
      </div>
    </li>
  );
};

export default ContentCard;
