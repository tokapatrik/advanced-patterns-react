import { useState } from "react";

import { Button } from "@/features/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/features/shared/components/ui/Dialog";
import { useToast } from "@/features/shared/hooks/useToast";
import { trpc } from "@/router";

import { CommentForList, CommentOptimistic } from "../types";

type CommentDeleteDialogProps = {
  comment: CommentForList;
};

const CommentDeleteDialog = ({ comment }: CommentDeleteDialogProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const deleteMutation = trpc.comments.delete.useMutation({
    onMutate: async ({ id }) => {
      setIsDeleteDialogOpen(false);

      await Promise.all([
        utils.comments.byExperienceId.cancel({
          experienceId: comment.experienceId,
        }),
        utils.experiences.byId.cancel({
          id: comment.experienceId,
        }),
      ]);

      setIsDeleteDialogOpen(false);

      const previousData = {
        byExperienceId: utils.comments.byExperienceId.getData({
          experienceId: comment.experienceId,
        }),
        experienceById: utils.experiences.byId.getData({
          id: comment.experienceId,
        }),
      };

      utils.comments.byExperienceId.setData(
        { experienceId: comment.experienceId },
        (oldData) => {
          if (!oldData) {
            return;
          }

          return oldData.filter((c) => c.id !== id);
        },
      );

      utils.experiences.byId.setData(
        { id: comment.experienceId },
        (oldData) => {
          if (!oldData) {
            return;
          }

          return {
            ...oldData,
            commentsCount: Math.max(0, oldData.commentsCount - 1),
          };
        },
      );

      const { dismiss } = toast({
        title: "Comment deleted",
        description: "Your comment has been deleted",
      });

      return { dismiss, previousData };
    },
    onError: (error, _, context) => {
      context?.dismiss?.();

      utils.comments.byExperienceId.setData(
        { experienceId: comment.experienceId },
        context?.previousData.byExperienceId,
      );

      utils.experiences.byId.setData(
        { id: comment.experienceId },
        context?.previousData.experienceById,
      );
      toast({
        title: "Failed to delete comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive-link"
          disabled={(comment as CommentOptimistic).optimistic}
        >
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Comment</DialogTitle>
        </DialogHeader>
        <p className="text-neutral-600 dark:text-neutral-400">
          Are you sure you want to delete this comment? This action cannot be
          undone.
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              deleteMutation.mutate({ id: comment.id });
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { CommentDeleteDialog };
