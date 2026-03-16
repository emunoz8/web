type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="app-empty-state">
      <h3 className="app-empty-state-title">{title}</h3>
      <p className="app-empty-state-copy">{description}</p>
    </div>
  );
}
