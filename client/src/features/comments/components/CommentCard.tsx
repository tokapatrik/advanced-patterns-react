import { useState } from "react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import Card from "@/features/shared/components/ui/Card";
import Link from "@/features/shared/components/ui/Link";
import { UserAvatar } from "@/features/users/components/UserAvatar";

import { CommentForList } from "../types";
import { CommentDeleteDialog } from "./CommentDeleteDialog";
import { CommentEditForm } from "./CommentEditForm";

type CommentCardProps = {
  comment: CommentForList;
};

const CommentCard = ({ comment }: CommentCardProps) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return <CommentEditForm comment={comment} setIsEditing={setIsEditing} />;
  }

  return (
    <Card className="space-y-4">
      <CommentCardHeader comment={comment} />
      <CommentCardContent comment={comment} />
      <CommentCardButtons comment={comment} setIsEditing={setIsEditing} />
    </Card>
  );
};

type CommentCardHeaderProps = Pick<CommentCardProps, "comment">;

const CommentCardHeader = ({ comment }: CommentCardHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <Link to="/users/$userId" params={{ userId: comment.user.id }}>
        <UserAvatar user={comment.user} />
      </Link>
      <time className="text-sm text-neutral-500">
        · {new Date(comment.createdAt).toLocaleDateString()}
      </time>
    </div>
  );
};

type CommentCardContentProps = Pick<CommentCardProps, "comment">;

const CommentCardContent = ({ comment }: CommentCardContentProps) => {
  return <p>{comment.content}</p>;
};

type CommentCardButtonsProps = Pick<CommentCardProps, "comment"> & {
  setIsEditing: (value: boolean) => void;
};

const CommentCardButtons = ({
  comment,
  setIsEditing,
}: CommentCardButtonsProps) => {
  const { currentUser } = useCurrentUser();

  const isCommentOwner = currentUser?.id === comment.userId;
  const isExperienceOwner = currentUser?.id === comment.experience.userId;

  if (!isCommentOwner && !isExperienceOwner) {
    return null;
  }

  return (
    <div className="flex gap-4">
      {isCommentOwner && (
        <Button variant="link" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
      )}
      {(isCommentOwner || isExperienceOwner) && (
        <CommentDeleteDialog comment={comment} />
      )}
    </div>
  );
};

export { CommentCard };
