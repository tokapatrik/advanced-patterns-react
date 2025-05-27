import { Comment, User } from "@advanced-react/server/database/schema";

type CommentWithUser = Comment & {
  user: User;
};
type CommentForList = CommentWithUser;

export type { CommentForList };
