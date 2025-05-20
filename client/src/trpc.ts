import type { AppRouter } from "@advanced-react/server";
import { createTRPCReact } from "@trpc/react-query";

const trpc = createTRPCReact<AppRouter>();

export { trpc };
