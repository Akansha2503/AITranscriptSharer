import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSummarySchema, sendEmailSchema } from "@shared/schema";
import { createTransport } from "nodemailer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate summary endpoint
  app.post("/api/generate-summary", async (req, res) => {
    try {
      const { transcript, customInstruction } = generateSummarySchema.parse(req.body);
      
      const groqApiKey = process.env.GROQ_API_KEY;
      if (!groqApiKey) {
        return res.status(500).json({ message: "GROQ_API_KEY not configured" });
      }

      // Call Groq API
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant that creates clear, actionable meeting summaries. Format your response as HTML with proper headings, bullet points, and structure."
            },
            {
              role: "user",
              content: `Please summarize this meeting transcript:\n\n${transcript}\n\n${customInstruction ? `Additional instructions: ${customInstruction}` : "Please create a standard meeting summary with key decisions, action items, and next steps."}`
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error("Groq API error:", errorText);
        return res.status(500).json({ message: "Failed to generate summary" });
      }

      const groqData = await groqResponse.json();
      const summary = groqData.choices[0]?.message?.content;

      if (!summary) {
        return res.status(500).json({ message: "No summary generated" });
      }

      // Store summary
      const savedSummary = await storage.createSummary({
        transcript,
        customInstruction,
        summary,
      });

      res.json({ 
        id: savedSummary.id,
        summary: savedSummary.summary 
      });
    } catch (error) {
      console.error("Generate summary error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid request" 
      });
    }
  });

  // Send email endpoint
  app.post("/api/send-email", async (req, res) => {
    try {
      const { recipient, subject, message, summary } = sendEmailSchema.parse(req.body);
      
      const mailHost = process.env.MAIL_HOST;
      const mailPort = process.env.MAIL_PORT;
      const mailUser = process.env.MAIL_USER;
      const mailPass = process.env.MAIL_PASS;
      const mailFrom = process.env.MAIL_FROM || mailUser;

      if (!mailHost || !mailPort || !mailUser || !mailPass) {
        return res.status(500).json({ message: "Email configuration not complete" });
      }

      // Create transporter
      const transporter = createTransport({
        host: mailHost,
        port: parseInt(mailPort),
        secure: parseInt(mailPort) === 465,
        auth: {
          user: mailUser,
          pass: mailPass,
        },
      });

      // Prepare email content
      const htmlContent = `
        ${message ? `<p>${message.replace(/\n/g, '<br>')}</p><hr>` : ''}
        ${summary}
      `;

      // Send email
      await transporter.sendMail({
        from: mailFrom,
        to: recipient,
        subject,
        html: htmlContent,
      });

      res.json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Send email error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to send email" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
