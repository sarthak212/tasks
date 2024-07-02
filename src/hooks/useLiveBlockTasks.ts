// hooks/useTasks.ts
import { useMutation, useStorage, useBroadcastEvent } from "@/lib/liveblocks";

export function useLiveBlockTasks() {
  const tasks = useStorage((root) => root.tasks);
  const broadcast = useBroadcastEvent();

  const createTask = useMutation(({ storage }, newTask) => {
    storage.get("tasks").push(newTask);
    broadcast({ type: "TASK_CREATED", task: newTask });
  }, []);

  return {
    tasks,
    createTask,
  };
}
