export const JIT_CAFE_BASE_PATH = "/jit-cafe";
export const JIT_CAFE_MENU_PATH = `${JIT_CAFE_BASE_PATH}/menu`;
export const JIT_CAFE_CONTACT_PATH = `${JIT_CAFE_BASE_PATH}/contact-us`;

const JIT_CAFE_ASSET_BASE_PATH = "/assets/features/jit-cafe";

export function getJitCafeAssetPath(path: string) {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${JIT_CAFE_ASSET_BASE_PATH}/${normalizedPath}`;
}

export function isJitCafePath(pathname: string) {
  return pathname === JIT_CAFE_BASE_PATH || pathname.startsWith(`${JIT_CAFE_BASE_PATH}/`);
}
