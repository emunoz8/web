type TreeLinksProps = {
  classCount: number;
};

function TreeLinks({ classCount }: TreeLinksProps) {
  return (
    <svg className="tree-links" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <marker id="ttt-arrow-head" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
        </marker>
      </defs>
      {Array.from({ length: classCount }).map((_, index) => {
        const x = ((index + 0.5) / classCount) * 100;
        return <line key={index} x1="50" y1="6" x2={x} y2="96" markerEnd="url(#ttt-arrow-head)" />;
      })}
    </svg>
  );
}

export default TreeLinks;
