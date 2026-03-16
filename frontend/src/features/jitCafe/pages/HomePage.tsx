import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import {
  JIT_CAFE_CONTACT_PATH,
  JIT_CAFE_MENU_PATH,
  getJitCafeAssetPath,
} from "../lib/paths";

const historyMoments = [
  {
    title: "Menu-first presentation",
    description:
      "The public site is organized around the food menu so visitors immediately land on the page doing the most visual and informational work.",
  },
  {
    title: "Designed for easy scanning",
    description:
      "Categories, descriptions, prices, and imagery are arranged to help people move through the menu without feeling buried in options.",
  },
  {
    title: "Built to feel like a restaurant menu",
    description:
      "The goal is not just to list items, but to give the menu enough structure and personality that it can carry the guest-facing experience on its own.",
  },
];

const sampleAreas = [
  {
    title: "Food menu",
    description:
      "Browse the guest-facing menu and see how the design balances categories, item details, pricing, and presentation.",
    to: JIT_CAFE_MENU_PATH,
    label: "Open menu",
  },
  {
    title: "Contact us",
    description:
      "Visit the business-facing page that rounds out the public site and gives the project a complete guest-facing surface.",
    to: JIT_CAFE_CONTACT_PATH,
    label: "Open contact",
  },
];

const projectScreenshots = [
  {
    label: "Guest flow",
    title: "Build your order",
    description:
      "This screen represents the ordering entry point, where guests browse categories and sections before choosing an item to customize.",
    src: "online-order-build-your-order.png",
    alt: "Online ordering page showing category filters and a burger item card.",
  },
  {
    label: "Guest flow",
    title: "Customize item",
    description:
      "This screenshot shows the item customization modal, where guests adjust ingredient portions, choose add-ons, and add extra condiments before adding the item to the cart.",
    src: "online-order-customize-item.png",
    alt: "Item customization modal with ingredient choices, add-ons, and condiment cup controls.",
  },
  {
    label: "Guest flow",
    title: "Review cart",
    description:
      "This page represents the cart review step, where guests can edit an item, change quantity, remove a selection, and see the running order total before checkout.",
    src: "online-order-cart-review.png",
    alt: "Cart review page with one bacon cheeseburger, quantity controls, and order total summary.",
  },
  {
    label: "Guest flow",
    title: "Checkout",
    description:
      "This screen represents the final checkout form, where guest information, pickup details, and the order summary are reviewed before submission.",
    src: "online-order-checkout.png",
    alt: "Checkout page with guest information fields, pickup details, and a submit order sidebar.",
  },
  {
    label: "Guest flow",
    title: "Track order",
    description:
      "This screenshot shows the tracking page, where the submitted order can be followed through live backend status updates, timing, and pickup details.",
    src: "online-order-track-order.png",
    alt: "Order tracking page with current stage, progress timeline, and pickup details.",
  },
  {
    label: "Staff view",
    title: "Incoming orders board",
    description:
      "This screen represents the staff order board, where pickup timing can be adjusted and incoming orders are moved through New, Accepted, Preparing, and Ready.",
    src: "staff-incoming-orders.png",
    alt: "Staff incoming orders page with pickup time range controls and order status columns.",
  },
  {
    label: "Staff view",
    title: "Menu catalog",
    description:
      "This screenshot shows the staff catalog view, where menu items are filtered by category or section and opened for editing from the same workspace.",
    src: "staff-menu-catalog.png",
    alt: "Staff menu catalog page showing guest-facing menu item cards and category filters.",
  },
  {
    label: "Staff view",
    title: "Menu item editor",
    description:
      "This screen represents the item editor, where staff can change item details like section, description, price, image, availability, featured state, and ingredient setup.",
    src: "staff-menu-item-editor.png",
    alt: "Staff menu item editor form with price, description, image, and availability fields.",
  },
].map((shot) => ({
  ...shot,
  src: getJitCafeAssetPath(shot.src),
}));

export function HomePage() {
  return (
    <div className="home-page-shell">
      <section className="home-page-hero" aria-labelledby="home-page-title">
        <header className="home-page-hero-copy">
          <p className="home-page-eyebrow">Restaurant website</p>
          <h1 id="home-page-title" className="home-page-title">
            A menu-first restaurant site designed to feel clear and polished.
          </h1>
          <p className="home-page-lead">
            JIT Cafe is presented as a three-page restaurant website built around the food menu.
            The goal is to make the menu easy to browse, visually grounded, and strong enough to
            carry the guest experience on its own.
          </p>

          <div className="home-page-hero-actions">
            <Link to={JIT_CAFE_MENU_PATH}>
              <Button>Explore food menu</Button>
            </Link>
            <Link to={JIT_CAFE_CONTACT_PATH} className="home-page-action-link">
              Contact us
            </Link>
          </div>
        </header>

        <aside className="home-page-signature" aria-label="JIT Cafe brand mark and quick facts">
          <img
            src={getJitCafeAssetPath("logo-mark.png")}
            alt="JIT Cafe logo"
            className="home-page-signature-logo"
            width="936"
            height="945"
          />

          <dl className="home-page-signature-meta">
            <div className="home-page-meta-row">
              <dt className="home-page-meta-label">Project type</dt>
              <dd className="home-page-meta-value">Restaurant website</dd>
              <dd className="home-page-meta-note">
                A guest-facing site centered on a polished menu presentation.
              </dd>
            </div>
            <div className="home-page-meta-row">
              <dt className="home-page-meta-label">Built by</dt>
              <dd className="home-page-meta-value">Edwin Muñoz</dd>
              <dd className="home-page-meta-note">
                Designed and developed through CompilingJava.com.
              </dd>
            </div>
            <div className="home-page-meta-row">
              <dt className="home-page-meta-label">Primary focus</dt>
              <dd className="home-page-meta-value">Menu page design</dd>
              <dd className="home-page-meta-note">
                The food menu is the main visual anchor for the public experience.
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="home-page-sheet" aria-label="Food menu design">
        <div className="home-page-sheet-main">
          <p className="home-page-section-label">Menu design</p>
          <h2 className="home-page-section-title">The food menu is the center of the public experience</h2>
          <p className="home-page-section-body">
            Instead of treating the menu like a secondary utility page, the site is organized
            around it. The menu is meant to feel like the main event: something visitors can browse
            comfortably, understand quickly, and connect back to the restaurant identity.
          </p>

          <div className="home-page-line-list">
            {historyMoments.map((moment, index) => (
              <div key={moment.title} className="home-page-line-row">
                <p className="home-page-line-index">0{index + 1}</p>
                <h3 className="home-page-line-title">{moment.title}</h3>
                <p className="home-page-line-description">{moment.description}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="home-page-sheet-side">
          <p className="home-page-section-label">Design goal</p>
          <h3 className="home-page-side-title">Built for clarity first</h3>
          <p className="home-page-side-copy">
            The menu page is designed to help people make decisions without feeling crowded by the
            interface. Categories, spacing, descriptions, prices, and imagery all work together to
            keep the page readable.
          </p>
          <p className="home-page-side-note">
            The design priority is a menu that feels confident, not cluttered.
          </p>
        </aside>
      </section>

      <section className="home-page-sheet" aria-label="Project overview">
        <div className="home-page-sheet-main">
          <p className="home-page-section-label">Overview</p>
          <h2 className="home-page-section-title">How the three public pages were designed</h2>
          <div className="home-page-body-copy">
            <p>
              The home page was designed to act like an introduction instead of a generic landing
              page. Its job is to explain the project quickly, establish the visual tone, and point
              visitors toward the menu without overloading them.
            </p>
            <p>
              The food menu was designed as the core experience. It carries the strongest visual
              hierarchy in the site and gives categories, item descriptions, prices, and imagery
              enough room to feel intentional rather than cramped.
            </p>
            <p>
              The contact page was designed as a quieter endpoint. It gives the site a clean
              business-facing page and lets the public navigation feel complete without competing
              with the menu for attention.
            </p>
          </div>

          <div className="home-page-line-list">
            <div className="home-page-line-row">
              <p className="home-page-line-index">01</p>
              <h3 className="home-page-line-title">Home page introduction</h3>
              <p className="home-page-line-description">
                Built to introduce the project, set tone, and direct attention toward the menu.
              </p>
            </div>
            <div className="home-page-line-row">
              <p className="home-page-line-index">02</p>
              <h3 className="home-page-line-title">Food menu centerpiece</h3>
              <p className="home-page-line-description">
                Designed to carry the strongest browsing experience across the public site.
              </p>
            </div>
            <div className="home-page-line-row">
              <p className="home-page-line-index">03</p>
              <h3 className="home-page-line-title">Contact page finish</h3>
              <p className="home-page-line-description">
                Gives the site a dedicated business-facing endpoint and rounds out the navigation.
              </p>
            </div>
          </div>
        </div>

        <aside className="home-page-sheet-side">
          <p className="home-page-section-label">Page structure</p>
          <h3 className="home-page-side-title">Three pages with clear jobs</h3>
          <p className="home-page-side-copy">
            Each page was given a different role on purpose: the home page introduces, the food
            menu delivers the main browsing experience, and the contact page closes the loop with a
            clean business-facing surface.
          </p>
          <p className="home-page-side-note">
            That structure keeps the navigation simple while letting the menu stay central.
          </p>
        </aside>
      </section>

      <section className="home-page-columns" aria-label="Website highlights and walkthrough">
        <div className="home-page-column">
          <p className="home-page-section-label">Menu page</p>
          <h2 className="home-page-section-title">What stands out in the food menu design</h2>
          <div className="home-page-body-copy">
            <p>
              The menu is organized so visitors can move from category to category without losing
              context. Sections create rhythm and make browsing feel deliberate instead of endless.
            </p>
            <p>
              Each item card balances name, description, price, and imagery so the page stays
              informative without feeling dense. The goal is to help someone decide quickly while
              still giving the menu personality.
            </p>
            <p>
              On phones, the page is tuned so browsing stays comfortable. The sticky category bar
              keeps navigation close, the menu cards fit the viewport more naturally, and the
              category groups can be explored with horizontal swipe gestures instead of forcing a
              dense multi-column layout onto a small screen.
            </p>
          </div>

          <div className="home-page-line-list">
            <div className="home-page-line-row">
              <p className="home-page-line-index">Focus</p>
              <h3 className="home-page-line-title">Category-led browsing</h3>
              <p className="home-page-line-description">
                Distinct categories and sections break the menu into readable groups.
              </p>
            </div>
            <div className="home-page-line-row">
              <p className="home-page-line-index">Focus</p>
              <h3 className="home-page-line-title">Clear item presentation</h3>
              <p className="home-page-line-description">
                Titles, descriptions, prices, and imagery are arranged to make comparison easy.
              </p>
            </div>
            <div className="home-page-line-row">
              <p className="home-page-line-index">Focus</p>
              <h3 className="home-page-line-title">Phone-view navigation</h3>
              <p className="home-page-line-description">
                Sticky category tabs and swipeable card rows make the menu easier to browse on a
                smaller screen.
              </p>
            </div>
            <div className="home-page-line-row">
              <p className="home-page-line-index">Focus</p>
              <h3 className="home-page-line-title">Single-card readability</h3>
              <p className="home-page-line-description">
                On smaller screens, the card layout stays narrow and readable instead of compressing
                too much information side by side.
              </p>
            </div>
          </div>
        </div>

        <div className="home-page-column">
          <p className="home-page-section-label">Implementation</p>
          <h2 className="home-page-section-title">What is already implemented in the application</h2>
          <div className="home-page-body-copy">
            <p>
              The online ordering flow covers menu browsing, item customization, cart management,
              pickup checkout, and order tracking from the guest side of the application.
            </p>
            <p>
              The staff tools include incoming orders, pickup window control, order status updates
              through New, Accepted, Preparing, and Ready, plus completed order history with totals.
            </p>
            <p>
              The menu administration side supports managing items, changing prices, editing
              ingredients and add-ons, and handling CSV imports for broader catalog updates. Under
              that, Spring Boot, Flyway-managed data, JWT-protected staff access, and server-side
              order calculations support the full application.
            </p>
          </div>

          <div className="home-page-line-list">
            <div className="home-page-line-row">
              <p className="home-page-line-index">Focus</p>
              <h3 className="home-page-line-title">Online ordering flow</h3>
              <p className="home-page-line-description">
                Browse the menu, customize items, manage the cart, check out, and track the order.
              </p>
            </div>
            <div className="home-page-line-row">
              <p className="home-page-line-index">Focus</p>
              <h3 className="home-page-line-title">Staff order operations</h3>
              <p className="home-page-line-description">
                Manage pickup timing, move orders through statuses, and review completed tickets.
              </p>
            </div>
            <div className="home-page-line-row">
              <p className="home-page-line-index">Focus</p>
              <h3 className="home-page-line-title">Menu administration</h3>
              <p className="home-page-line-description">
                Update items, adjust prices, manage ingredients and add-ons, and import catalog
                changes.
              </p>
            </div>
            <div className="home-page-line-row">
              <p className="home-page-line-index">Focus</p>
              <h3 className="home-page-line-title">Backend foundation</h3>
              <p className="home-page-line-description">
                Spring Boot, Flyway, JWT auth, seeded data, and server-side order logic support the
                full workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-page-sheet" aria-label="Application screenshots">
        <div className="home-page-sheet-main home-page-sheet-main-full">
          <p className="home-page-section-label">Screenshots</p>
          <h2 className="home-page-section-title">Key screens and what they represent</h2>
          <p className="home-page-section-body">
            These screenshots show the main parts of the application across the guest ordering flow
            and the internal staff tools. Each one represents a different part of the product story
            already implemented in the project.
          </p>

          <div className="home-page-screenshot-grid">
            {projectScreenshots.map((shot) => (
              <article key={shot.src} className="home-page-screenshot-card">
                <div className="home-page-screenshot-frame">
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    className="home-page-screenshot-image"
                    loading="lazy"
                  />
                </div>
                <div className="home-page-screenshot-copy">
                  <p className="home-page-screenshot-label">{shot.label}</p>
                  <h3 className="home-page-screenshot-title">{shot.title}</h3>
                  <p className="home-page-screenshot-description">{shot.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-page-sheet" aria-label="Explore the sample">
        <div className="home-page-sheet-main home-page-sheet-main-full">
          <p className="home-page-section-label">Explore</p>
          <h2 className="home-page-section-title">What to explore on the public site</h2>
          <p className="home-page-section-body">
            These are the public pages that define the guest-facing website experience.
          </p>

          <div className="home-page-destination-list">
            {sampleAreas.map((area) => (
              <div key={area.title} className="home-page-destination-row">
                <div className="home-page-destination-copy">
                  <p className="home-page-line-index">Surface</p>
                  <h3 className="home-page-line-title">{area.title}</h3>
                  <p className="home-page-line-description">{area.description}</p>
                </div>
                <Link to={area.to} className="home-page-action-link">
                  {area.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
