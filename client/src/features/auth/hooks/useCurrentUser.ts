import { trpc } from "@/router";

export const useCurrentUser = () => {
  const currentUserQuery = trpc.auth.currentUser.useQuery();

  return {
    access: currentUserQuery.data?.accessToken,
    currentUser: currentUserQuery.data?.currentUser,
  };
};
