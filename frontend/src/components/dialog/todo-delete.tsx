"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Todo } from "@/models/todo.model";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TodoDeleteDialogProps {
	open: boolean;
	todo?: Todo;
	onOpenChange: (open: boolean) => void;
	onCancel: () => void;
	onDelete: (todoId: string) => Promise<void>;
	onOptimisticDelete: (todo: Todo) => void;
	onOptimisticDeleteFailed: (todo: Todo) => void;
	onSuccess: () => void;
}

export function TodoDeleteDialog({
	open,
	todo,
	onOpenChange,
	onCancel,
	onDelete,
	onOptimisticDelete,
	onOptimisticDeleteFailed,
	onSuccess,
}: TodoDeleteDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const runDelete = useCallback(async (todoToDelete: Todo, isRetry = false) => {
		if (isDeleting) {
			return;
		}

		setIsDeleting(true);

		if (!isRetry) {
			onCancel();
		}

		onOptimisticDelete(todoToDelete);
		const loadingToastId = toast.loading("Deleting todo...");

		try {
			await onDelete(todoToDelete.id);

			toast.success("Todo deleted successfully", {
				id: loadingToastId,
			});
			onSuccess();
		} catch (error) {
			onOptimisticDeleteFailed(todoToDelete);
			toast.error("Failed to delete todo", {
				id: loadingToastId,
				description: (error as Error).message,
			});

			toast.error("Request failed", {
				description: "Click retry to try again.",
				action: {
					label: "Retry",
					onClick: () => {
						void runDelete(todoToDelete, true);
					},
				},
			});
		} finally {
			setIsDeleting(false);
		}
	}, [isDeleting, onCancel, onDelete, onOptimisticDelete, onOptimisticDeleteFailed, onSuccess]);

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogTitle>Delete todo?</AlertDialogTitle>
					<AlertDialogDescription className="whitespace-pre-line">
						This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting}>
						Cancel
					</Button>

					<Button
						type="button"
						variant="destructive"
						onClick={() => {
							if (!todo) {
								return;
							}

							void runDelete(todo);
						}}
						disabled={!todo || isDeleting}
					>
						Delete
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
