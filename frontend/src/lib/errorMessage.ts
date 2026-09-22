import { isAxiosError } from "axios";

export function errorMessage(error: unknown, fallback = "Không thể thực hiện. Vui lòng thử lại.") {
  return isAxiosError(error) ? error.response?.data?.message || fallback : fallback;
}
