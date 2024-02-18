import {
  createCookieSessionStorageFactory,
  createCookieFactory,
  redirect,
  json,
  SessionStorage,
} from "@remix-run/server-runtime";
import { FlashSessionValues, ToastMessage, flashSessionValuesSchema } from "./schema";
import { sign, unsign } from "./crypto";

const FLASH_SESSION = "flash";
const createCookie = createCookieFactory({ sign, unsign });

const sessionStorage = createCookieSessionStorageFactory(createCookie)({
  cookie: {
    name: "toast-session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: ["s3Cr3t"],
  },
});

function getSessionFromRequest(request: Request, customSession?: SessionStorage) {
  const cookie = request.headers.get("Cookie");
  const sessionToUse = customSession ? customSession : sessionStorage;
  return sessionToUse.getSession(cookie);
}

async function flashMessage(
  flash: FlashSessionValues,
  headers?: ResponseInit["headers"],
  customSession?: SessionStorage,
) {
  const sessionToUse = customSession ? customSession : sessionStorage;
  const session = await sessionToUse.getSession();
  session.flash(FLASH_SESSION, flash);
  const cookie = await sessionToUse.commitSession(session);
  const newHeaders = new Headers(headers);
  newHeaders.append("Set-Cookie", cookie);
  return newHeaders;
}

async function redirectWithFlash(
  url: string,
  flash: FlashSessionValues,
  init?: ResponseInit,
  customSession?: SessionStorage,
) {
  return redirect(url, {
    ...init,
    headers: await flashMessage(flash, init?.headers, customSession),
  });
}

async function jsonWithFlash<T>(
  data: T,
  flash: FlashSessionValues,
  init?: ResponseInit,
  customSession?: SessionStorage,
) {
  return json(data, {
    ...init,
    headers: await flashMessage(flash, init?.headers, customSession),
  });
}

type BaseFactoryType = {
  session?: SessionStorage;
  type: "info" | "success" | "error" | "warning";
};

const jsonWithToastFactory = ({ type, session }: BaseFactoryType) => {
  return <T>(
    data: T,
    messageOrToast: string | Omit<ToastMessage, "type">,
    init?: ResponseInit,
    customSession?: SessionStorage,
  ) => {
    const finalInfo = typeof messageOrToast === "string" ? { message: messageOrToast } : messageOrToast;
    return jsonWithFlash(data, { toast: { ...finalInfo, type } }, init, customSession ?? session);
  };
};

const redirectWithToastFactory = ({ type, session }: BaseFactoryType) => {
  return (
    redirectUrl: string,
    messageOrToast: string | Omit<ToastMessage, "type">,
    init?: ResponseInit,
    customSession?: SessionStorage,
  ) => {
    const finalInfo = typeof messageOrToast === "string" ? { message: messageOrToast } : messageOrToast;
    return redirectWithFlash(redirectUrl, { toast: { ...finalInfo, type } }, init, customSession ?? session);
  };
};

/**
 * Helper method used to get the toast data from the current request and purge the flash storage from the session
 * @param request Current request
 * @returns Returns the the toast notification if exists, undefined otherwise and the headers needed to purge it from the session
 */
export async function getToast(
  request: Request,
  customSession?: SessionStorage,
): Promise<{ toast: ToastMessage | undefined; headers: Headers }> {
  const session = await getSessionFromRequest(request, customSession);
  const result = flashSessionValuesSchema.safeParse(session.get(FLASH_SESSION));
  const flash = result.success ? result.data : undefined;
  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(session),
  });
  const toast = flash?.toast;
  return { toast, headers };
}

export type { ToastMessage };

/**
 * Helper method used to initialize the whole library using a custom session. Returns all the utilities enhanced with the custom session
 * you provide.
 *
 * These utilities will not override the default session, but will use the custom one you provide. So be careful of imports if you plan to
 * use both, or only plan to use this one.
 * @param session Custom session to be used instead of the default one
 * @returns Returns all the utilities you need to display toast notifications and redirect the user or return jsons with toast notifications
 */
export const createToastUtilsWithCustomSession = (session: SessionStorage) => {
  return {
    jsonWithToast: <T>(data: T, toast: ToastMessage, init?: ResponseInit) => {
      return jsonWithFlash(data, { toast }, init, session);
    },
    jsonWithSuccess: jsonWithToastFactory({ type: "success", session }),
    jsonWithError: jsonWithToastFactory({ type: "error", session }),
    jsonWithInfo: jsonWithToastFactory({ type: "info", session }),
    jsonWithWarning: jsonWithToastFactory({ type: "warning", session }),
    redirectWithToast: (redirectUrl: string, toast: ToastMessage, init?: ResponseInit) => {
      return redirectWithFlash(redirectUrl, { toast }, init, session);
    },
    redirectWithSuccess: redirectWithToastFactory({ type: "success", session }),
    redirectWithError: redirectWithToastFactory({ type: "error", session }),
    redirectWithInfo: redirectWithToastFactory({ type: "info", session }),
    redirectWithWarning: redirectWithToastFactory({ type: "warning", session }),
    getToast: (request: Request) => getToast(request, session),
  };
};

/**
 * Helper method used to display a toast notification without redirection
 *
 * @param data Generic object containing the data
 * @param toast Toast message and it's type
 * @param init Additional response options (status code, additional headers etc)
 * @returns Returns data with toast cookie set
 */
export const jsonWithToast = <T>(data: T, toast: ToastMessage, init?: ResponseInit, customSession?: SessionStorage) => {
  return jsonWithFlash(data, { toast }, init, customSession);
};

/**
 * Helper method used to generate a JSON response object with a success toast message.
 *
 * @param data The data to be included in the response.
 * @param message The message for the success toast notification.
 * @param init Additional response options (status code, additional headers etc)
 * @returns Returns a JSON response object with the specified success toast message.
 */
export const jsonWithSuccess = jsonWithToastFactory({ type: "success" });

/**
 * Helper method used to generate a JSON response object with an error toast message.
 *
 * @param data The data to be included in the response.
 * @param message The message for the error toast notification.
 * @param init Additional response options (status code, additional headers etc)
 * @returns Returns a JSON response object with the specified error toast message.
 */
export const jsonWithError = jsonWithToastFactory({ type: "error" });
/**
 * Helper method used to generate a JSON response object with an info toast message.
 *
 * @param data The data to be included in the response.
 * @param message The message for the info toast notification.
 * @param init Additional response options (status code, additional headers etc)
 * @returns Returns a JSON response object with the specified info toast message.
 */
export const jsonWithInfo = jsonWithToastFactory({ type: "info" });

/**
 * Helper method used to generate a JSON response object with a warning toast message.
 *
 * @param data The data to be included in the response.
 * @param message The message for the warning toast notification.
 * @param init Additional response options (status code, additional headers etc)
 * @returns Returns a JSON response object with the specified warning toast message.
 */
export const jsonWithWarning = jsonWithToastFactory({ type: "warning" });

/**
 * Helper method used to redirect the user to a new page with a toast notification
 *
 * If thrown it needs to be awaited
 * @param url Redirect URL
 * @param toast Toast message and it's type
 * @param init Additional response options (status code, additional headers etc)
 * @returns Returns redirect response with toast cookie set
 */
export const redirectWithToast = (
  redirectUrl: string,
  toast: ToastMessage,
  init?: ResponseInit,
  customSession?: SessionStorage,
) => {
  return redirectWithFlash(redirectUrl, { toast }, init, customSession);
};

/**
 * Helper method used to redirect the user to a new page with an error toast notification
 *
 * If this method is thrown it needs to be awaited, otherwise it can just be returned
 * @param redirectUrl Redirect url
 * @param message Message to be shown as info
 * @param init Additional response options (status code, additional headers etc)
 * @returns Returns redirect response with toast cookie set
 */
export const redirectWithError = redirectWithToastFactory({ type: "error" });

/**
 * Helper method used to redirect the user to a new page with a success toast notification
 *
 * If this method is thrown it needs to be awaited, otherwise it can just be returned
 * @param redirectUrl Redirect url
 * @param message Message to be shown as info
 * @param init Additional response options (status code, additional headers etc)
 * @returns Returns redirect response with toast cookie set
 */
export const redirectWithSuccess = redirectWithToastFactory({ type: "success" });

/**
 * Helper method used to redirect the user to a new page with a warning toast notification
 *
 * If this method is thrown it needs to be awaited, otherwise it can just be returned
 * @param redirectUrl Redirect url
 * @param message Message to be shown as info
 * @param init Additional response options (status code, additional headers etc)
 * @returns Returns redirect response with toast cookie set
 */
export const redirectWithWarning = redirectWithToastFactory({ type: "warning" });

/**
 * Helper method used to redirect the user to a new page with a info toast notification
 *
 * If this method is thrown it needs to be awaited, otherwise it can just be returned
 * @param redirectUrl Redirect url
 * @param message Message to be shown as info
 * @param init Additional response options (status code, additional headers etc)
 * @returns Returns redirect response with toast cookie set
 */
export const redirectWithInfo = redirectWithToastFactory({ type: "info" });
