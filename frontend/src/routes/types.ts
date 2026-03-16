// src/routes/publicRoutes.ts
import type { ComponentType, LazyExoticComponent } from "react";

export type RoutePageComponent =
  | ComponentType<any>
  | LazyExoticComponent<ComponentType<any>>;

export interface PublicRoute {
  to: string;
  label: string;
  Component: RoutePageComponent;
  showInNav?: boolean;
  requiresAdmin?: boolean;
}


