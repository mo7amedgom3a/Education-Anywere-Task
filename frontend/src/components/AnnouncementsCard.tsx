import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Plus, Trash2 } from "lucide-react";
import { announcementService } from "@/services/announcementService";
import { AnnouncementDTO, AnnouncementInputDTO, AnnouncementUpdateDTO } from "@/types/announcement";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const getAvatarColor = (index: number) => {
  const colors = ["bg-pink-400", "bg-orange-400", "bg-yellow-400", "bg-gray-600", "bg-blue-400", "bg-green-400"];
  return colors[index % colors.length];
};

const getInitial = (name: string) => {
  return name.charAt(0).toUpperCase();
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (days === 1) {
    return 'Yesterday';
  } else {
    return `${days} days ago`;
  }
};

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  authorName: z.string().min(1, "Author name is required"),
  category: z.string().optional(),
  authorAvatar: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

const toPayload = (values: AnnouncementFormValues): AnnouncementInputDTO | AnnouncementUpdateDTO => ({
  title: values.title.trim(),
  content: values.content.trim(),
  authorName: values.authorName.trim(),
  category: values.category?.trim() ? values.category.trim() : null,
  authorAvatar: values.authorAvatar?.trim() ? values.authorAvatar.trim() : null,
});

export const AnnouncementsCard = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementService.getAll(),
  });

  const editingAvatarIndex = activeAnnouncement
    ? Math.max(announcements.findIndex((a) => a.id === activeAnnouncement.id), 0)
    : 0;

  const createForm = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      authorName: "",
      category: "",
      authorAvatar: "",
    },
  });

  const editForm = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      authorName: "",
      category: "",
      authorAvatar: "",
    },
  });

  useEffect(() => {
    if (activeAnnouncement) {
      editForm.reset({
        title: activeAnnouncement.title,
        content: activeAnnouncement.content,
        authorName: activeAnnouncement.authorName,
        category: activeAnnouncement.category ?? "",
        authorAvatar: activeAnnouncement.authorAvatar ?? "",
      });
    }
  }, [editForm, activeAnnouncement]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: AnnouncementInputDTO) => announcementService.create(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<AnnouncementDTO[]>(['announcements'], (old) => {
        if (!old) return [data];
        return [data, ...old];
      });
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
      createForm.reset();
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AnnouncementUpdateDTO }) =>
      announcementService.update(id, payload),
    onSuccess: (data) => {
      if (!data) return;
      queryClient.setQueryData<AnnouncementDTO[]>(['announcements'], (old) => {
        if (!old) return [data];
        return old.map((item) => (item.id === data.id ? data : item));
      });
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
      setActiveAnnouncement(data);
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update announcement",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleCreateSubmit = (values: AnnouncementFormValues) => {
    createMutation.mutate(toPayload(values) as AnnouncementInputDTO);
  };

  const handleUpdateSubmit = (values: AnnouncementFormValues) => {
    if (!activeAnnouncement) return;
    updateMutation.mutate({ id: activeAnnouncement.id, payload: toPayload(values) });
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-text-primary">Announcements</CardTitle>
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
          <CardTitle className="text-lg font-semibold text-text-primary">Announcements</CardTitle>
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
        <CardContent className="space-y-4">
          {announcements.map((announcement, index) => (
            <div
              key={announcement.id}
              className="flex gap-3 p-2 rounded-lg transition-colors group relative"
            >
              <div
                className="flex-1 flex gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2"
                onClick={() => {
                  setActiveAnnouncement(announcement);
                  setIsEditing(false);
                }}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={`${getAvatarColor(index)} text-white font-medium`}>
                    {getInitial(announcement.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-text-primary">{announcement.authorName}</p>
                      <p className="text-xs text-text-secondary">{announcement.category}</p>
                    </div>
                    <span className="text-xs text-text-light whitespace-nowrap">
                      {formatTimeAgo(announcement.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                    {announcement.content}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(announcement.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            createForm.reset();
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>Share news, reminders, or important updates with everyone.</DialogDescription>
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
                      <Input placeholder="Announcement title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. School Management" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. General, Math 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="authorAvatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="Write your announcement..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!activeAnnouncement}
        onOpenChange={(open) => {
          if (!open) {
            setActiveAnnouncement(null);
            setIsEditing(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className={`${getAvatarColor(editingAvatarIndex)} text-white font-medium text-lg`}>
                  {activeAnnouncement && getInitial(activeAnnouncement.authorName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">
                  {activeAnnouncement ? activeAnnouncement.authorName : ""}
                </DialogTitle>
                {activeAnnouncement && (
                  <p className="text-sm text-muted-foreground">
                    {formatTimeAgo(activeAnnouncement.createdAt)} • {activeAnnouncement.category || "General"}
                  </p>
                )}
              </div>
            </div>
          </DialogHeader>
          {activeAnnouncement && (
            <div className="space-y-6">
              {!isEditing && (
                <>
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-text-light mb-1">Title</h4>
                        <p className="text-base text-text-primary">{activeAnnouncement.title}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text-light mb-1">Category</h4>
                        <p className="text-base text-text-primary">
                          {activeAnnouncement.category || "General"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text-light mb-1">Message</h4>
                        <p className="text-base text-text-secondary leading-relaxed whitespace-pre-wrap">
                          {activeAnnouncement.content}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setActiveAnnouncement(null)}>
                      Close
                    </Button>
                    <Button onClick={() => setIsEditing(true)}>Edit Announcement</Button>
                  </div>
                </>
              )}

              {isEditing && (
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(handleUpdateSubmit)} className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="authorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Author Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="authorAvatar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Author Avatar URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea rows={5} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save changes"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
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
