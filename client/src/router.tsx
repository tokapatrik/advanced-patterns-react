import { AppRouter } from "@advanced-react/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import {
  createTRPCQueryUtils,
  createTRPCReact,
  getQueryKey,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
  TRPCClientError,
  TRPCLink,
} from "@trpc/react-query";
import { observable } from "@trpc/server/observable";

import { ErrorComponent } from "./features/shared/components/ErrorComponent";
import { NotFoundComponent } from "./features/shared/components/NotFoundComponent";
import Spinner from "./features/shared/components/ui/Spinner";
import { env } from "./lib/utils/env";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient();

const trpc = createTRPCReact<AppRouter>();

const customLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value);
        },
        error(err) {
          if (err?.data?.code === "UNAUTHORIZED") {
            router.navigate({ to: "/login" });
          }

          observer.error(err);
        },
        complete() {
          observer.complete();
        },
      });
      return unsubscribe;
    });
  };
};

const getHeaders = () => {
  const queryKey = getQueryKey(trpc.auth.currentUser);
  const token = queryClient.getQueryData<{ accessToken: string }>(
    queryKey,
  )?.accessToken;

  return {
    Authorization: token ? `Bearer ${token}` : undefined,
  };
};

const trpcClinet = trpc.createClient({
  links: [
    customLink,
    splitLink({
      condition(op) {
        return isNonJsonSerializable(op.input);
      },
      true: httpLink({
        url: env.VITE_SERVER_BASE_URL,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
        headers: getHeaders(),
      }),
      false: httpBatchLink({
        url: env.VITE_SERVER_BASE_URL,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
        headers: getHeaders(),
      }),
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
    defaultNotFoundComponent: NotFoundComponent,
    Wrap: ({ children }) => (
      <trpc.Provider client={trpcClinet} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools />
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

export function isTRPCClientError(
  cause: unknown,
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}

export { trpc, trpcClinet, trpcQueryUtils, router };
