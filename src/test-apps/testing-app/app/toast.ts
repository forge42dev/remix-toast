import { createCookieSessionStorage } from "@remix-run/node";
import { createToastUtilsWithCustomSession } from "remix-toast";

const session = createCookieSessionStorage({
  cookie: {
    name: "toast",
    secrets: ["some-secret"],
  },
});

export const {
  redirectWithError,
  redirectWithWarning,
  redirectWithSuccess,
  getToast,
  jsonWithSuccess,
  jsonWithError,
  jsonWithInfo,
  jsonWithWarning,
} = createToastUtilsWithCustomSession(session);
