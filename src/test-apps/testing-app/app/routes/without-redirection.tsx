import { cssBundleHref } from "@remix-run/css-bundle";
import { DataFunctionArgs, type LinksFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect } from "react";
import { displayErrorMessage, displaySuccessMessage } from "../../../../index";

export const links: LinksFunction = () => [...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : [])];

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData();
  const messageType = formData.get("messageType");

  switch (messageType) {
    case "success":
      return displaySuccessMessage("This is a success message");
    case "error":
      return displayErrorMessage("This is an error message");
  }
}

export default function TestWithModals() {
  const actionData = useActionData<typeof action>();

  useEffect(() => {
    if (actionData) {
      if ("successMessage" in actionData) {
        //Do something
      }
      if ("errorMessage" in actionData) {
        //Do something
      }
    }
  }, [actionData]);

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.8",
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
  );
}
