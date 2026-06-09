import { environment } from "@/environments/environment";
import axios from "axios";

// api.service.ts
export const searchValue = async (
  column: string,
  value: string,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
) => {
  const response = await axios.get(
    `${environment.apiUrl}/search/${column}/${encodeURIComponent(value)}?page=${page}&limit=${pageSize}`,
    { signal },
  );
  return response.data;
};
