import { toast } from 'sonner';

export const t = {
  success: (msg: string) => toast.success(msg),
  error:   (msg: string) => toast.error(msg),
  info:    (msg: string) => toast(msg),
};
