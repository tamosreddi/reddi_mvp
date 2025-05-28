import { toast as sonnerToast } from "sonner";

export function useToast() {
  return {
    success: (msg: string) => sonnerToast.success(msg),
    error: (msg: string) => sonnerToast.error(msg),
    info: (msg: string) => sonnerToast(msg),
  };
}
