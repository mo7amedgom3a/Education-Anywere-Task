import { useMemo, useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, ClipboardList, Trash2, Calendar, Clock4, Plus } from "lucide-react";
import { quizService } from "@/services/quizService";
import { QuizDTO, QuizInputDTO } from "@/types/quiz";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const isValidDate = (date?: Date | null) => !!date && !Number.isNaN(date.getTime());

const formatLongDate = (date?: Date | null, fallback = "Date to be announced") =>
  isValidDate(date) ? format(date!, "EEEE, MMMM d 'at' hh:mm a") : fallback;

const quizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  course: z.string().min(1, "Course is required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
});

type QuizFormValues = z.infer<typeof quizSchema>;

export const WhatsDueCard = () => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizDTO | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => quizService.getAll(),
  });

  const createForm = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      course: "",
      description: "",
      dueDate: ""
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quizService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: "Success",
        description: "Quiz/Assignment deleted successfully",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete quiz/assignment",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const createMutation = useMutation({
    mutationFn: (payload: QuizInputDTO) => quizService.create(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<QuizDTO[]>(['quizzes'], (old) => {
        if (!old) return [data];
        return [data, ...old];
      });
      toast({ title: "Success", description: "Quiz created successfully" });
      createForm.reset();
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create quiz",
        variant: "destructive",
      });
    },
  });

  const handleCreateSubmit = (values: QuizFormValues) => {
    const dueDateTime = new Date(values.dueDate);
    if (Number.isNaN(dueDateTime.getTime())) {
      toast({
        title: "Please provide a valid due date.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({
      title: values.title.trim(),
      course: values.course.trim(),
      description: values.description?.trim() || null,
      dueDate: dueDateTime.toISOString(),
    });
  };

  const getButtonText = useCallback(
    (quiz: QuizDTO) => (quiz.title.toLowerCase().includes("quiz") ? "Start Quiz" : "Solve Assignment"),
    [],
  );

  const getItemType = (quiz: QuizDTO): "quiz" | "assignment" =>
    quiz.title.toLowerCase().includes("quiz") ? "quiz" : "assignment";

  const getStatusLabel = useCallback(
    (dueDate?: Date | null) => {
      if (!isValidDate(dueDate)) {
        return { label: "TBD", color: "text-text-secondary" };
      }

      const now = new Date();
      const diff = dueDate!.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (diff < 0) {
        return { label: "Overdue", color: "text-red-500" };
      } else if (hours < 24) {
        return { label: "Today", color: "text-orange-500" };
      } else if (days === 1) {
        return { label: "Tomorrow", color: "text-yellow-500" };
      } else {
        return { label: `${days} days`, color: "text-text-secondary" };
      }
    },
    [],
  );

  const sortedQuizzes = useMemo(() => {
    return [...quizzes].sort((a, b) => {
      const aTime = isValidDate(a.dueDate) ? a.dueDate.getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = isValidDate(b.dueDate) ? b.dueDate.getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
  }, [quizzes]);

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-text-primary">What's due</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold text-text-primary">What's due</CardTitle>
          <div className="flex items-center gap-2">
            <button className="text-sm text-turquoise hover:underline font-medium">All</button>
            <Button
              size="icon"
              variant="outline"
              className="text-turquoise border-turquoise hover:bg-turquoise hover:text-white"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {sortedQuizzes.map((quiz) => {
            const itemType = getItemType(quiz);
            const status = getStatusLabel(quiz.dueDate);
            
            return (
              <div key={quiz.id} className="space-y-3 group relative">
                <div className="flex items-start gap-3 cursor-pointer" onClick={() => setActiveQuiz(quiz)}>
                  <div className={`p-2 rounded-lg ${itemType === "quiz" ? "bg-turquoise/10" : "bg-primary/10"}`}>
                    {itemType === "quiz" ? (
                      <FileText className="h-5 w-5 text-turquoise" />
                    ) : (
                      <ClipboardList className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-text-primary">{quiz.title}</h4>
                    <p className="text-sm text-text-secondary">{quiz.course}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(quiz.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-text-secondary">
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      <span className={status.color}>{status.label}</span>
                    </p>
                    <p>
                      <span className="font-medium">Time:</span>{" "}
                      {isValidDate(quiz.dueDate) ? format(quiz.dueDate, "hh:mm a") : "TBD"}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-turquoise text-turquoise hover:bg-turquoise hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveQuiz(quiz);
                    }}
                  >
                    {getButtonText(quiz)}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) createForm.reset();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Quiz / Assignment</DialogTitle>
            <DialogDescription>Plan upcoming work and sync it with the backend.</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Unit 3 Quiz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Physics 201" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Optional details..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!activeQuiz} onOpenChange={(open) => !open && setActiveQuiz(null)}>
        <DialogContent className="max-w-lg">
          {activeQuiz && (
            <>
              <DialogHeader>
                <DialogTitle>{activeQuiz.title}</DialogTitle>
                <DialogDescription>
                  {activeQuiz.course} • {formatLongDate(activeQuiz.dueDate)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {activeQuiz.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-light mb-1">Description</h4>
                    <p className="text-text-secondary leading-relaxed">{activeQuiz.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Calendar className="h-4 w-4 text-turquoise" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-text-light">Due Date</p>
                      <p className="font-medium text-text-primary">
                        {isValidDate(activeQuiz.dueDate) ? format(activeQuiz.dueDate, 'MMM d, yyyy') : 'TBD'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Clock4 className="h-4 w-4 text-turquoise" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-text-light">Time</p>
                      <p className="font-medium text-text-primary">
                        {isValidDate(activeQuiz.dueDate) ? format(activeQuiz.dueDate, 'hh:mm a') : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setActiveQuiz(null)}>
                    Close
                  </Button>
                  <Button className="bg-turquoise text-white hover:bg-turquoise/90">
                    {getButtonText(activeQuiz)}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz/Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
