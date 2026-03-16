import { startTransition, useEffect, useRef, useState } from "react";
import { portfolioProfile } from "../../portfolio/data/profile";

type StoryStep = {
  label: string;
  title: string;
  body: string;
  note: string;
  bullets?: string[];
  railEyebrow: string;
  railTitle: string;
  railBody: string;
  railPoints: string[];
};

const homeStorySteps: StoryStep[] = [
  {
    label: "Approach",
    title: "Start with the real operational problem",
    body: portfolioProfile.aboutParagraphs[0],
    note: "Useful software should reduce friction, not just look finished in a screenshot.",
    railEyebrow: "In practice",
    railTitle: "The first pass should solve the real bottleneck",
    railBody: "Most useful projects start from workflow friction, not from a visual concept alone.",
    railPoints: [
      "Map the repeated task before choosing abstractions.",
      "Keep the first backend model small enough to stay readable.",
      "Shape the UI around actions people actually repeat.",
      "Build for maintainability early instead of patching it on later.",
    ],
  },
  {
    label: "Context",
    title: "Build close to the people actually using the system",
    body: portfolioProfile.aboutParagraphs[1],
    note: "Program work, publishing, and workflow support all keep the engineering grounded.",
    railEyebrow: "Why it matters",
    railTitle: "Real users force clearer product decisions",
    railBody: "The surrounding organization usually reveals what needs to be simple, reliable, and easy to maintain.",
    railPoints: [
      "Administrative work exposes where manual processes break down.",
      "Content and workflow tools need to stay understandable for non-engineers.",
      "Public-facing pages still have to reflect backend realities.",
      "Useful software is judged by whether people keep using it without hand-holding.",
    ],
  },
  {
    label: "Range",
    title: "Move cleanly from backend structure to frontend delivery",
    body: portfolioProfile.aboutParagraphs[2],
    note: "The goal is one readable system, not disconnected layers of code.",
    railEyebrow: "Scope",
    railTitle: "The handoff between layers should stay clear",
    railBody: "Product work gets smoother when backend, data, interface, and deployment decisions are treated as one system.",
    railPoints: [
      "Domain structure and API design set the pace for the rest of the build.",
      "Relational modeling should support the product flow, not fight it.",
      "Frontend work should expose the system cleanly rather than decorate it.",
      "Deployment and production debugging are part of delivery, not a separate phase.",
    ],
  },
  {
    label: "Stack",
    title: "Lean on tools that make iteration faster and clearer",
    body: portfolioProfile.summary,
    note: "Core tools used most often across the work.",
    bullets: portfolioProfile.techHighlights.map((item) => `${item.label}: ${item.value}`),
    railEyebrow: "Current stack",
    railTitle: "A small set of tools carries most of the work",
    railBody: "The stack stays focused so iteration can move quickly without losing architectural clarity.",
    railPoints: portfolioProfile.stackGroups.map(
      (group) => `${group.label}: ${group.items.slice(0, 3).join(", ")}`,
    ),
  },
];

function StandardHomeStory() {
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const triggers = triggerRefs.current.filter((trigger): trigger is HTMLDivElement => trigger !== null);
    if (triggers.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

        if (visibleEntries.length === 0) {
          return;
        }

        const nextIndex = Number(visibleEntries[0].target.getAttribute("data-story-index") ?? 0);
        startTransition(() => {
          setActiveIndex((currentIndex) => (currentIndex === nextIndex ? currentIndex : nextIndex));
        });
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      },
    );

    triggers.forEach((trigger) => observer.observe(trigger));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="border-b border-brand-line/16 pb-14">
      <div className="space-y-4 lg:hidden">
        {homeStorySteps.map((step) => (
          <article key={step.title} className="portfolio-panel-muted p-6 sm:p-7">
            <p className="portfolio-kicker">{step.label}</p>
            <h3 className="portfolio-display-subtitle mt-4">{step.title}</h3>
            <p className="mt-4 portfolio-copy">{step.body}</p>
            <p className="mt-5 portfolio-mono-detail">{step.note}</p>
            {step.bullets ? (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {step.bullets.map((bullet) => (
                  <li key={bullet} className="border-t border-brand-line/14 pt-3 portfolio-copy">
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>

      <div className="hidden gap-12 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
        <div className="sticky top-24 self-start">
          <div className="portfolio-panel p-8">
            <div className="flex gap-2" aria-hidden="true">
              {homeStorySteps.map((step, index) => (
                <span
                  key={step.title}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    index === activeIndex ? "bg-brand-accent/80" : "bg-brand-line/20"
                  }`}
                />
              ))}
            </div>

            <div className="relative mt-8 min-h-[28rem] overflow-hidden">
              {homeStorySteps.map((step, index) => {
                const stateClassName =
                  index === activeIndex
                    ? "translate-y-0 opacity-100"
                    : index < activeIndex
                      ? "-translate-y-12 opacity-0"
                      : "translate-y-12 opacity-0";

                return (
                  <article
                    key={step.title}
                    aria-hidden={index !== activeIndex}
                    className={`absolute inset-0 flex flex-col justify-between transition-all duration-500 ease-out motion-reduce:transition-none ${stateClassName}`}
                  >
                    <div>
                      <p className="portfolio-kicker">{step.label}</p>
                      <h3 className="portfolio-display-title mt-4 max-w-2xl">{step.title}</h3>
                      <p className="mt-6 max-w-2xl portfolio-copy">{step.body}</p>
                    </div>

                    <div className="border-t border-brand-line/14 pt-5">
                      <p className="portfolio-mono-detail">{step.note}</p>
                      {step.bullets ? (
                        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                          {step.bullets.map((bullet) => (
                            <li key={bullet} className="border-t border-brand-line/14 pt-3 portfolio-copy">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

      <div>
          {homeStorySteps.map((step, index) => (
            <div
              key={step.title}
              ref={(node) => {
                triggerRefs.current[index] = node;
              }}
              data-story-index={index}
              className="flex min-h-[68vh] items-center"
            >
              <article
                className={`w-full rounded-[1.75rem] border p-6 transition-all duration-300 ${
                  index === activeIndex
                    ? "border-brand-frame/28 bg-brand-surface/78"
                    : "border-brand-line/14 bg-brand-surface/42"
                }`}
              >
                <p className="portfolio-kicker">{step.railEyebrow}</p>
                <h3 className="portfolio-display-subtitle mt-3">{step.railTitle}</h3>
                <p className="mt-3 portfolio-copy">{step.railBody}</p>
                <ul className="mt-5 space-y-3 border-t border-brand-line/14 pt-4">
                  {step.railPoints.map((point) => (
                    <li key={point} className="border-t border-brand-line/12 pt-3 first:border-t-0 first:pt-0 portfolio-copy">
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StandardHomeStory;
