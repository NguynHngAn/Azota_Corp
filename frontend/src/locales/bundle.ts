import { authMessages as enAuth } from "./en/auth";
import { commonMessages as enCommon } from "./en/common";
import { productMessages as enProduct } from "./en/product";
import { authMessages as viAuth } from "./vi/auth";
import { commonMessages as viCommon } from "./vi/common";
import { productMessages as viProduct } from "./vi/product";

/** Preserves per-key string literal types (needed for `{{param}}` inference on `t()`). */
export type EnMessagesMap = typeof enCommon & typeof enAuth & typeof enProduct;
export type ViMessagesMap = typeof viCommon & typeof viAuth & typeof viProduct;

/** Single source of truth for English UI strings (flat keys). */
export const enMessages = {
  ...enCommon,
  ...enAuth,
  ...enProduct,
} as EnMessagesMap;

/** Single source of truth for Vietnamese UI strings (flat keys). */
export const viMessages = {
  ...viCommon,
  ...viAuth,
  ...viProduct,
} as ViMessagesMap;
