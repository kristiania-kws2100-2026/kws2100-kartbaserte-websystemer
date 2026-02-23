import { createRoot } from "react-dom/client";

function Application() {
  return <div>A map application</div>;
}

createRoot(document.getElementById("app")!).render(<Application />);
