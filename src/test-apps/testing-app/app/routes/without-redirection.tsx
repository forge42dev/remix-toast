import { cssBundleHref } from "@remix-run/css-bundle";
import { DataFunctionArgs, type LinksFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { jsonWithError, jsonWithInfo, jsonWithSuccess, jsonWithWarning } from "remix-toast";

export const links: LinksFunction = () => [...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : [])];

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData();
  const messageType = formData.get("messageType");

  // The empty object passed as the first argument can be used
  // to include additional data to be returned along with the toasters.
  switch (messageType) {
    case "success":
      return jsonWithSuccess({}, "This is a success message");
    case "error":
      return jsonWithError({}, "This is an error message");
    case "info":
      return jsonWithInfo({}, "This is an info");
    case "warning":
      return jsonWithWarning({}, "This is a warning");
  }
}

export default function TestWithoutRedirection() {
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
          Test <b>success message</b> without redirection
          <Form method="POST">
            <button name="messageType" value="success" type="submit">
              Click here
            </button>
          </Form>
        </div>
        <div>
          Test <b>error message</b> without redirection
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
          Test <b>warning message</b> without redirection
          <Form method="POST">
            <button name="messageType" value="warning" type="submit">
              Click here
            </button>
          </Form>
        </div>
        <div>
          Test <b>info message</b> without redirection
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
