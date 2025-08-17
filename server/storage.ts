import { type Summary, type InsertSummary } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createSummary(summary: InsertSummary): Promise<Summary>;
  getSummary(id: string): Promise<Summary | undefined>;
}

export class MemStorage implements IStorage {
  private summaries: Map<string, Summary>;

  constructor() {
    this.summaries = new Map();
  }

  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const id = randomUUID();
    const summary: Summary = { 
      ...insertSummary, 
      id,
      customInstruction: insertSummary.customInstruction || null,
      createdAt: new Date()
    };
    this.summaries.set(id, summary);
    return summary;
  }

  async getSummary(id: string): Promise<Summary | undefined> {
    return this.summaries.get(id);
  }
}

export const storage = new MemStorage();
