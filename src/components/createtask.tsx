"use client";
import { useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTask } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUser";
import { useLiveBlockTasks } from "@/hooks/useLiveBlockTasks";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "inprogress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  userid: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function CreateTask() {
  const [open, setOpen] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });
  const { data: userData } = useUsers();
  const createTask = useCreateTask();
  const { createTask: liveBlockCreate } = useLiveBlockTasks();

  const onSubmit = (data: TaskFormData) => {
    createTask.mutate(
      {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        userId: data.userid,
      },
      {
        onSuccess: (responseData) => {
          setOpen(false);
          liveBlockCreate(responseData);
          reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Fill in the details for your new task.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" className="col-span-3" {...register("title")} />
              {errors.title && (
                <p className="text-red-500 col-span-3 col-start-2">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                {...register("description")}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange({
                        target: { value },
                        name: field.name,
                      });
                    }}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="inprogress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange({
                        target: { value },
                        name: field.name,
                      });
                    }}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && (
                <p className="text-red-500 col-span-3 col-start-2">
                  {errors.priority.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assigned" className="text-right">
                Assigned To
              </Label>
              <Controller
                name="userid"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange({
                        target: { value },
                        name: field.name,
                      });
                    }}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select Assigned User" />
                    </SelectTrigger>
                    <SelectContent>
                      {userData?.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.userid && (
                <p className="text-red-500 col-span-3 col-start-2">
                  {errors.userid.message} userid{" "}
                  {JSON.stringify({ ...register("userid") })}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
