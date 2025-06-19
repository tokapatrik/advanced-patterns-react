import {
  Comment,
  Experience,
  User,
} from "@advanced-react/server/database/schema";

type CommentWithUser = Comment & {
  user: User;
};

type CommentWithExperience = Comment & {
  experience: Experience;
};
type CommentForList = CommentWithUser & CommentWithExperience;

export type { CommentForList };
