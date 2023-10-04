import { z } from "zod";

export const toastMessageSchema = z.object({
  message: z.string(),
  type: z.custom<"info" | "success" | "error" | "warning">(),
});

export const flashSessionValuesSchema = z.object({
  toast: toastMessageSchema.optional(),
});

export type ToastMessage = z.infer<typeof toastMessageSchema>;

export type FlashSessionValues = z.infer<typeof flashSessionValuesSchema>;
