import { data, type LinksFunction, type LoaderFunctionArgs } from "react-router";
import { useSubmit } from "react-router";
import { getToast, redirectWithSuccess } from "remix-toast";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { toast, headers } = await getToast(request);

  return data({ toast }, { headers });
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
