import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import { Entry } from "./components/Entry";
import DApp from "./pages/DApp";
import { WagmiProvider } from "wagmi";
import { config } from "./wagmi.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DApp />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);

function App() {
  // const {isLoading,relatives, isError } = useRelativeInformation();

  return (
    <QueryClientProvider client={new QueryClient()}>
      <WagmiProvider config={config}>
        <div className="flex items-center justify-center h-screen">
          <RouterProvider router={router} />
        </div>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
