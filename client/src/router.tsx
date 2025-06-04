import { AppRouter } from "@advanced-react/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import {
  createTRPCQueryUtils,
  createTRPCReact,
  httpBatchLink,
} from "@trpc/react-query";

import { ErrorComponent } from "./features/shared/components/ErrorComponent";
import Spinner from "./features/shared/components/ui/Spinner";
import { env } from "./lib/utils/env";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient();

const trpc = createTRPCReact<AppRouter>();

const trpcClinet = trpc.createClient({
  links: [
    httpBatchLink({
      url: env.VITE_SERVER_BASE_URL,
    }),
  ],
});

const trpcQueryUtils = createTRPCQueryUtils({
  client: trpcClinet,
  queryClient,
});

const createRouter = () => {
  const router = createTanstackRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    context: {
      trpcQueryUtils,
    },
    defaultPendingComponent: () => (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    ),
    defaultErrorComponent: ErrorComponent,
    Wrap: ({ children }) => (
      <trpc.Provider client={trpcClinet} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    ),
  });

  return router;
};

const router = createRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

export { trpc, trpcClinet, trpcQueryUtils, router };
