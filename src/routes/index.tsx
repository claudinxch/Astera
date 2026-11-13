import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      Welcome to Astera, your go-to academic managment platform! Powered by AI
    </div>
  );
}
