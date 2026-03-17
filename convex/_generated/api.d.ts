/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accountDeletion from "../accountDeletion.js";
import type * as auditLogs from "../auditLogs.js";
import type * as companies from "../companies.js";
import type * as featuredArticles from "../featuredArticles.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as migrations from "../migrations.js";
import type * as pageConfigs from "../pageConfigs.js";
import type * as platformSettings from "../platformSettings.js";
import type * as reports from "../reports.js";
import type * as reviews from "../reviews.js";
import type * as savedListings from "../savedListings.js";
import type * as seed from "../seed.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";
import type * as waitlist from "../waitlist.js";
import type * as xendit from "../xendit.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accountDeletion: typeof accountDeletion;
  auditLogs: typeof auditLogs;
  companies: typeof companies;
  featuredArticles: typeof featuredArticles;
  files: typeof files;
  http: typeof http;
  migrations: typeof migrations;
  pageConfigs: typeof pageConfigs;
  platformSettings: typeof platformSettings;
  reports: typeof reports;
  reviews: typeof reviews;
  savedListings: typeof savedListings;
  seed: typeof seed;
  subscriptions: typeof subscriptions;
  users: typeof users;
  waitlist: typeof waitlist;
  xendit: typeof xendit;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
