import { cssBundleHref } from "@remix-run/css-bundle";
import { json, type LinksFunction, type LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { getToast, redirectWithSuccess } from "remix-toast";

export const links: LinksFunction = () => [...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : [])];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { toast, headers } = await getToast(request);
  return json({ toast }, { headers });
};

export const action = () => {
  return redirectWithSuccess("/test", "This is a success message");
};

export default function App() {
  return (
    <div>
      <Link to={"/"}>back</Link>
    </div>
  );
}
