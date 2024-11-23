import {
  redirect,
  SessionStorage,
  SessionIdStorageStrategy,
  createCookieSessionStorage,
  data as dataFn,
} from "react-router";
import { FlashSessionValues, ToastMessage, flashSessionValuesSchema } from "./schema";

const FLASH_SESSION = "flash";
type ToastCookieOptions = Partial<SessionIdStorageStrategy["cookie"]>;

const toastCookieOptions = {
  name: "toast-session",
  sameSite: "lax",
  path: "/",
  httpOnly: true,
  secrets: ["s3Cr3t"],
} satisfies ToastCookieOptions;

const sessionStorage = createCookieSessionStorage({
  cookie: toastCookieOptions,
});

/**
 * Sets the cookie options to be used for the toast cookie
 *
 * @param options Cookie options to be used for the toast cookie
 */
export function setToastCookieOptions(options: ToastCookieOptions) {
  Object.assign(toastCookieOptions, options);
  Object.assign(
    sessionStorage,
    createCookieSessionStorage({
      cookie: toastCookieOptions,
    }),
  );
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

async function dataWithFlash<T>(
  data: T,
  flash: FlashSessionValues,
  init?: ResponseInit,
  customSession?: SessionStorage,
) {
  return dataFn(data, {
    ...init,
    headers: await flashMessage(flash, init?.headers, customSession),
  });
}

type BaseFactoryType = {
  session?: SessionStorage;
  type: "info" | "success" | "error" | "warning";
};

const dataWithToastFactory = ({ type, session }: BaseFactoryType) => {
  return <T>(
    data: T,
    messageOrToast: string | Omit<ToastMessage, "type">,
    init?: ResponseInit,
    customSession?: SessionStorage,
  ) => {
    const finalInfo = typeof messageOrToast === "string" ? { message: messageOrToast } : messageOrToast;
    return dataWithFlash(data, { toast: { ...finalInfo, type } }, init, customSession ?? session);
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
  const sessionToUse = customSession ? customSession : sessionStorage;
  const cookie = request.headers.get("Cookie");
  const session = await sessionToUse.getSession(cookie);
  const result = flashSessionValuesSchema.safeParse(session.get(FLASH_SESSION));
  const flash = result.success ? result.data : undefined;
  const headers = new Headers({
    "Set-Cookie": await sessionToUse.commitSession(session),
  });
  const toast = flash?.toast;
  return { toast, headers };
}

export type { ToastMessage, ToastCookieOptions };

/**
 * Helper method used to initialize the whole library using a custom session. Returns all the utilities enhanced with the custom session
 * you provide.
 *
 * These utilities will not override the default session, but will use the custom one you provide. So be careful of imports if you plan to
 * use both, or only plan to use this one.
 * @param session Custom session to be used instead of the default one
 * @returns Returns all the utilities you need to display toast notifications and redirect the user or return data functions with toast notifications
 */
export const createToastUtilsWithCustomSession = (session: SessionStorage) => {
  return {
    dataWithToast: <T>(data: T, toast: ToastMessage, init?: ResponseInit) => {
      return dataWithFlash(data, { toast }, init, session);
    },
    dataWithSuccess: dataWithToastFactory({ type: "success", session }),
    dataWithError: dataWithToastFactory({ type: "error", session }),
    dataWithInfo: dataWithToastFactory({ type: "info", session }),
    dataWithWarning: dataWithToastFactory({ type: "warning", session }),
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
export const dataWithToast = <T>(data: T, toast: ToastMessage, init?: ResponseInit, customSession?: SessionStorage) => {
  return dataWithFlash(data, { toast }, init, customSession);
};

/**
 * Helper method used to generate a data response object with a success toast message.
 *
 * @param data The data to be included in the response.
 * @param message The message for the success toast notification.
 * @param init Additional response options (status code, additional headers etc)
 * @returns Returns a data response object with the specified success toast message.
 */
export const dataWithSuccess = dataWithToastFactory({ type: "success" });

/**
 * Helper method used to generate a data response object with an error toast message.
 *
 * @param data The data to be included in the response.
 * @param message The message for the error toast notification.
 * @param init Additional response options (status code, additional headers etc)
 * @returns Returns a data response object with the specified error toast message.
 */
export const dataWithError = dataWithToastFactory({ type: "error" });
/**
 * Helper method used to generate a data response object with an info toast message.
 *
 * @param data The data to be included in the response.
 * @param message The message for the info toast notification.
 * @param init Additional response options (status code, additional headers etc)
 * @returns Returns a data response object with the specified info toast message.
 */
export const dataWithInfo = dataWithToastFactory({ type: "info" });

/**
 * Helper method used to generate a data response object with a warning toast message.
 *
 * @param data The data to be included in the response.
 * @param message The message for the warning toast notification.
 * @param init Additional response options (status code, additional headers etc)
 * @returns Returns a data response object with the specified warning toast message.
 */
export const dataWithWarning = dataWithToastFactory({ type: "warning" });

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
