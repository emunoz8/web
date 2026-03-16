import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import type { LoginRouteState } from "../../lib/authRouting";

function RouteScrollReset() {
  const location = useLocation();
  const locationState = location.state as LoginRouteState | null;
  const activeLocation = locationState?.backgroundLocation ?? location;
  const routeKey = `${activeLocation.pathname}${activeLocation.search}`;

  useLayoutEffect(() => {
    window.scrollTo({
      left: 0,
      top: 0,
    });

    document.querySelectorAll<HTMLElement>(".terminal-open-content").forEach((element) => {
      element.scrollTo({
        left: 0,
        top: 0,
      });
    });
  }, [routeKey]);

  return null;
}

export default RouteScrollReset;
