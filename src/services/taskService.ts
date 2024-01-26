import { $authHost, API_URL } from "@/utils/api/http";
import { TASKS_PER_PAGE } from "./constants";
import { IAdditionalTask } from "@/models/IAdditionalTask";

export const taskFilters = {
  excludeDone: { "projectTask.optional.isDone": { $ne: true } },
  onlyDone: { "projectTask.optional.isDone": true },
  onlyActive: { "projectTask.optional.isActive": true },
  onlyFavorite: { "projectTask.optional.isFavorite": true },
  onlyRoutine: { "projectTask.taskType": "routine" },
  onlyHardTime: { "projectTask.taskType": "hardTime" },
  onlyAdditional: { "projectTask.taskType": "additional" },
  onlyNrcMaint: { "additionalTask.taskType": "MAINT" },
  onlyHaveNRC: { "projectTask.optional.isHaveNRC": true },
};

export const composeUrl = (projectId: string, filter = {}) => {
  const filterQuery = encodeURIComponent(JSON.stringify(filter));
  const apiQueryParams = `filter=${filterQuery}`;
  return `/projects/${projectId}/aggregatedTasks?${apiQueryParams}`;
};

export default class TaskService {
  static async feathFiltered(projectId: string, filter = {}) {
    const url = composeUrl(projectId, filter);
    const response = await $authHost.get(url, {});
    return response;
  }
  static async setCurrentNRCTask(nrcCurrentTask: IAdditionalTask) {
    localStorage.setItem("activeNRCTask", nrcCurrentTask.id || "");
  }
}
