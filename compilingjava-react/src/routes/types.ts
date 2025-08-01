// src/routes/publicRoutes.ts
import { ComponentType } from "react";

export interface PublicRoute {
  to: string;
  label: string;
  Component: ComponentType<any>; // React component type (function/class)
}


