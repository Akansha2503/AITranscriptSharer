import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const summaries = pgTable("summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transcript: text("transcript").notNull(),
  customInstruction: text("custom_instruction"),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSummarySchema = createInsertSchema(summaries).pick({
  transcript: true,
  customInstruction: true,
  summary: true,
});

export const generateSummarySchema = z.object({
  transcript: z.string().min(1, "Transcript is required"),
  customInstruction: z.string().optional(),
});

export const sendEmailSchema = z.object({
  recipient: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().optional(),
  summary: z.string().min(1, "Summary is required"),
});

export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type Summary = typeof summaries.$inferSelect;
export type GenerateSummaryRequest = z.infer<typeof generateSummarySchema>;
export type SendEmailRequest = z.infer<typeof sendEmailSchema>;
