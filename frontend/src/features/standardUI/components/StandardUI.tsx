import { ReactNode } from "react";
import StandardFooter from "./StandardFooter";
import StandardHeader from "./StandardHeader";

type StandardUIProps = {
  children: ReactNode;
};

function StandardUI({ children }: StandardUIProps) {
  return (
    <div className="portfolio-site-shell flex min-h-screen w-full flex-col">
      <StandardHeader />
      <main className="portfolio-content-shell mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <StandardFooter />
    </div>
  );
}

export default StandardUI;
