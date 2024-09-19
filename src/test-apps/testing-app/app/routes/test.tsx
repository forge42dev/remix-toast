import { cssBundleHref } from "@remix-run/css-bundle";
import { json, type LinksFunction, type LoaderFunctionArgs } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import { getToast, redirectWithSuccess } from "remix-toast";
export const links: LinksFunction = () => [...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : [])];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { toast, headers } = await getToast(request);

  return json({ toast }, { headers });
};

export const action = () => {
  return redirectWithSuccess("/", "This is a success message");
};

export default function App() {
  const submit = useSubmit();
  return (
    <div>
      <button onClick={() => submit("/test", { method: "post" })}>back</button>
    </div>
  );
}
