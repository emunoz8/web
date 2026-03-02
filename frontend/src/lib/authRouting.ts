import { Location } from "react-router-dom";

export type LoginRouteState = {
  from?: Pick<Location, "pathname" | "search" | "hash">;
  backgroundLocation?: Location;
};

export const buildLoginRouteState = (location: Location): LoginRouteState => ({
  from: {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  },
  backgroundLocation: location,
});

