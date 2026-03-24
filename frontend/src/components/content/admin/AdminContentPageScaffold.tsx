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
    <section className="p-4 sm:p-6 md:p-10 space-y-6">
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
