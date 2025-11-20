import { useEffect, useState } from "react";
import type { TFunction } from "i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { AnnouncementDTO } from "@/types/announcement";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000').replace(/\/$/, '');

const resolveAvatarUrl = (value?: string | null) => {
  if (!value) return null;
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }

  const normalizedPath = value.startsWith('/') ? value : `/${value}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const getAvatarColor = (index: number) => {
  const colors = ["bg-pink-400", "bg-orange-400", "bg-yellow-400", "bg-gray-600", "bg-blue-400", "bg-green-400"];
  return colors[index % colors.length];
};

const getInitial = (name: string) => {
  return name.charAt(0).toUpperCase();
};

const formatTimeAgo = (date: Date, t: TFunction<"dashboard">) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 24) {
    return t(`announcements.timeAgo.hours${hours !== 1 ? "_plural" : ""}`, { count: hours || 1 });
  } else if (days === 1) {
    return t("announcements.timeAgo.yesterday");
  } else {
    return t(`announcements.timeAgo.days${days !== 1 ? "_plural" : ""}`, { count: days });
  }
};

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  authorName: z.string().min(1, "Author name is required"),
  category: z.string().optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export const AnnouncementsCard = () => {
  const { t } = useTranslation("dashboard");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createAvatarFile, setCreateAvatarFile] = useState<File | null>(null);
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
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
    },
  });

  const editForm = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      authorName: "",
      category: "",
    },
  });

  useEffect(() => {
    if (activeAnnouncement) {
      editForm.reset({
        title: activeAnnouncement.title,
        content: activeAnnouncement.content,
        authorName: activeAnnouncement.authorName,
        category: activeAnnouncement.category ?? "",
      });
    }
  }, [editForm, activeAnnouncement]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: t("announcements.title"),
        description: t("announcements.feedback.deleteSuccess"),
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: t("announcements.title"),
        description: t("announcements.feedback.deleteError"),
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: FormData) => announcementService.create(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<AnnouncementDTO[]>(['announcements'], (old) => {
        if (!old) return [data];
        return [data, ...old];
      });
      toast({
        title: t("announcements.title"),
        description: t("announcements.feedback.createSuccess"),
      });
      createForm.reset();
      setIsCreateOpen(false);
      setCreateAvatarFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: t("announcements.title"),
        description: error.message || t("announcements.feedback.createError"),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) =>
      announcementService.update(id, payload),
    onSuccess: (data) => {
      if (!data) return;
      queryClient.setQueryData<AnnouncementDTO[]>(['announcements'], (old) => {
        if (!old) return [data];
        return old.map((item) => (item.id === data.id ? data : item));
      });
      toast({
        title: t("announcements.title"),
        description: t("announcements.feedback.updateSuccess"),
      });
      setActiveAnnouncement(data);
      setIsEditing(false);
      setEditAvatarFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: t("announcements.title"),
        description: error.message || t("announcements.feedback.updateError"),
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const buildFormData = (values: AnnouncementFormValues, file?: File | null) => {
    const formData = new FormData();
    formData.append('title', values.title.trim());
    formData.append('content', values.content.trim());
    formData.append('authorName', values.authorName.trim());
    formData.append('category', values.category ?? '');
    if (file) {
      formData.append('authorAvatar', file);
    }
    return formData;
  };

  const handleCreateSubmit = (values: AnnouncementFormValues) => {
    createMutation.mutate(buildFormData(values, createAvatarFile));
  };

  const handleUpdateSubmit = (values: AnnouncementFormValues) => {
    if (!activeAnnouncement) return;
    updateMutation.mutate({ id: activeAnnouncement.id, payload: buildFormData(values, editAvatarFile) });
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-text-primary">
            {t("announcements.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary">{t("announcements.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold text-text-primary">
            {t("announcements.title")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <button className="text-sm text-turquoise hover:underline font-medium">
              {t("announcements.allFilter")}
            </button>
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
                  {resolveAvatarUrl(announcement.authorAvatar) && (
                    <AvatarImage src={resolveAvatarUrl(announcement.authorAvatar)!} alt={announcement.authorName} />
                  )}
                  <AvatarFallback className={`${getAvatarColor(index)} text-white font-medium`}>
                    {getInitial(announcement.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-text-primary">{announcement.authorName}</p>
                      <p className="text-xs text-text-secondary">
                        {announcement.category || t("announcements.emptyCategory")}
                      </p>
                    </div>
                    <span className="text-xs text-text-light whitespace-nowrap">
                      {formatTimeAgo(announcement.createdAt, t)}
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
            setCreateAvatarFile(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("announcements.createDialog.title")}</DialogTitle>
            <DialogDescription>{t("announcements.createDialog.description")}</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("announcements.fields.title.label")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("announcements.fields.title.placeholder")} {...field} />
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
                    <FormLabel>{t("announcements.fields.authorName.label")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("announcements.fields.authorName.placeholder")} {...field} />
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
                    <FormLabel>{t("announcements.fields.category.label")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("announcements.fields.category.placeholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>{t("announcements.fields.authorAvatar.label")}</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setCreateAvatarFile(file);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {createAvatarFile ? createAvatarFile.name : t("announcements.fields.authorAvatar.helper")}
                </p>
                {createAvatarFile && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setCreateAvatarFile(null)}>
                    {t("announcements.fields.authorAvatar.clear")}
                  </Button>
                )}
              </div>
              <FormField
                control={createForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("announcements.fields.content.label")}</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder={t("announcements.fields.content.placeholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? t("common.creating") : t("common.create")}
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
            setEditAvatarFile(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                {resolveAvatarUrl(activeAnnouncement?.authorAvatar) && (
                  <AvatarImage
                    src={resolveAvatarUrl(activeAnnouncement?.authorAvatar)!}
                    alt={activeAnnouncement?.authorName}
                  />
                )}
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
                    {formatTimeAgo(activeAnnouncement.createdAt, t)} •{" "}
                    {activeAnnouncement.category || t("announcements.emptyCategory")}
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
                        <h4 className="text-sm font-semibold text-text-light mb-1">
                          {t("announcements.viewDialog.title")}
                        </h4>
                        <p className="text-base text-text-primary">{activeAnnouncement.title}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text-light mb-1">
                          {t("announcements.viewDialog.category")}
                        </h4>
                        <p className="text-base text-text-primary">
                          {activeAnnouncement.category || t("announcements.emptyCategory")}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text-light mb-1">
                          {t("announcements.viewDialog.message")}
                        </h4>
                        <p className="text-base text-text-secondary leading-relaxed whitespace-pre-wrap">
                          {activeAnnouncement.content}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setActiveAnnouncement(null)}>
                      {t("announcements.viewDialog.close")}
                    </Button>
                    <Button onClick={() => setIsEditing(true)}>{t("announcements.viewDialog.edit")}</Button>
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
                            <FormLabel>{t("announcements.fields.title.label")}</FormLabel>
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
                            <FormLabel>{t("announcements.fields.authorName.label")}</FormLabel>
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
                            <FormLabel>{t("announcements.fields.category.label")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <FormLabel>{t("announcements.fields.authorAvatar.label")}</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setEditAvatarFile(file);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        {editAvatarFile ? editAvatarFile.name : t("announcements.fields.authorAvatar.helper")}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {editAvatarFile && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setEditAvatarFile(null)}>
                            {t("announcements.fields.authorAvatar.clear")}
                          </Button>
                        )}
                        {resolveAvatarUrl(activeAnnouncement?.authorAvatar) && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={resolveAvatarUrl(activeAnnouncement?.authorAvatar)!}
                                alt={activeAnnouncement?.authorName}
                              />
                              <AvatarFallback className="text-xs">
                                {getInitial(activeAnnouncement.authorName)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{t("announcements.fields.authorAvatar.current")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <FormField
                      control={editForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("announcements.fields.content.label")}</FormLabel>
                          <FormControl>
                            <Textarea rows={5} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setIsEditing(false);
                          setEditAvatarFile(null);
                        }}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? t("common.saving") : t("common.save")}
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
            <AlertDialogTitle>{t("announcements.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("announcements.deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("announcements.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
