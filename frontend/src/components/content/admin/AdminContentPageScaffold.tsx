import type { ReactNode } from "react";
import ContentModal from "../../common/ContentModal";
import ContentCategoryFilter from "../ContentCategoryFilter";
import ContentFeed from "../ContentFeed";
import AdminPageHeader from "./AdminPageHeader";
import type { AdminContentPageProps } from "./models/AdminContentPageViewModel";

type AdminContentPageScaffoldProps = AdminContentPageProps & {
  createSection: ReactNode;
  editSection?: ReactNode;
};

function AdminContentPageScaffold({
  headerProps,
  categoryFilterProps,
  feedProps,
  modalProps,
  createSection,
  editSection = null,
}: AdminContentPageScaffoldProps) {
  return (
    <section className="p-3 sm:p-4 md:p-8 space-y-4 sm:space-y-5">
      <AdminPageHeader {...headerProps} />
      {createSection}
      {editSection}
      <ContentCategoryFilter {...categoryFilterProps} />
      <ContentFeed {...feedProps} />
      <ContentModal {...modalProps} />
    </section>
  );
}

export default AdminContentPageScaffold;
