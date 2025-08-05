// GitHubLink.tsx
import { FaGithub } from "react-icons/fa";

interface GitHubLinkProps {
    size?: number;
  className?: string;
}

export default function GitHubLink({ size=24, className }: GitHubLinkProps) {
  return (
    <a
      href="https://github.com/emunoz8"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      className={`hover:opacity-75 transition ${className}`}
    >
      <FaGithub size={size} />
    </a>
  );
}
