import { ActionFunctionArgs, data, type LinksFunction, type LoaderFunctionArgs } from "react-router";
import { Form, useLoaderData } from "react-router";
import { useEffect } from "react";
import { toast as notify } from "react-toastify";
import toastStyles from "react-toastify/dist/ReactToastify.css?url";
import { getToast, redirectWithError, redirectWithInfo, redirectWithSuccess, redirectWithWarning } from "remix-toast";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: toastStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { toast, headers } = await getToast(request);
  return data({ toast }, { headers });
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const messageType = formData.get("messageType");

  // The empty object passed as the first argument can be used
  // to include additional data to be returned along with the toasters.
  switch (messageType) {
    case "success":
      return redirectWithSuccess("/from-library", "This is a success message");
    case "error":
      return redirectWithError("/from-library", "This is an error message");
    case "info":
      return redirectWithInfo("/from-library", "This is an info");
    case "warning":
      return redirectWithWarning("/from-library", "This is a warning");
  }
}

export default function App() {
  const { toast } = useLoaderData<typeof loader>();
  useEffect(() => {
    if (toast) {
      notify(toast.message, { type: toast.type });
    }
  }, [toast]);
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.8",
        display: "flex",
        flexDirection: "column",
        gap: "120px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "120px",
        }}
      >
        <div>
          Test <b>success message</b> with redirection
          <Form method="POST">
            <button name="messageType" value="success" type="submit">
              Click here
            </button>
          </Form>
        </div>
        <div>
          Test <b>error message</b> with redirection
          <Form method="POST">
            <button name="messageType" value="error" type="submit">
              Click here
            </button>
          </Form>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "120px",
        }}
      >
        <div>
          Test <b>warning message</b> with redirection
          <Form method="POST">
            <button name="messageType" value="warning" type="submit">
              Click here
            </button>
          </Form>
        </div>
        <div>
          Test <b>info message</b> with redirection
          <Form method="POST">
            <button name="messageType" value="info" type="submit">
              Click here
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
