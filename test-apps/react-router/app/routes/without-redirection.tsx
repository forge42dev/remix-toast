import { Form } from "react-router";
import { dataWithError, dataWithInfo, dataWithSuccess, dataWithWarning } from "remix-toast";
import { LoaderFunctionArgs } from "react-router";

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const messageType = formData.get("messageType");

  // The empty object passed as the first argument can be used
  // to include additional data to be returned along with the toasters.
  switch (messageType) {
    case "success":
      return dataWithSuccess({}, "This is a success message");
    case "error":
      return dataWithError({}, "This is an error message");
    case "info":
      return dataWithInfo({}, "This is an info");
    case "warning":
      return dataWithWarning({}, "This is a warning");
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
