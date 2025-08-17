import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import type { GenerateSummaryRequest, SendEmailRequest } from "@shared/schema";

export default function Home() {
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [transcriptText, setTranscriptText] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("Meeting Summary");
  const [emailMessage, setEmailMessage] = useState("");

  const { toast } = useToast();

  const generateSummaryMutation = useMutation({
    mutationFn: async (data: GenerateSummaryRequest) => {
      const response = await apiRequest("POST", "/api/generate-summary", data);
      return response.json();
    },
    onSuccess: (data) => {
      setSummary(data.summary);
      setShowSummary(true);
      toast({
        title: "Success",
        description: "Summary generated successfully!",
      });
      // Scroll to summary section
      setTimeout(() => {
        document.getElementById("summary-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate summary",
        variant: "destructive",
      });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: SendEmailRequest) => {
      const response = await apiRequest("POST", "/api/send-email", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Summary sent successfully to ${recipientEmail}!`,
      });
      // Reset email form
      setRecipientEmail("");
      setEmailSubject("Meeting Summary");
      setEmailMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = async (file: File) => {
    setTranscriptFile(file);
    setTranscriptText(""); // Clear text area when file is selected
    
    // Read file content
    try {
      const text = await file.text();
      setTranscriptText(text);
      toast({
        title: "File uploaded",
        description: `"${file.name}" loaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read file content",
        variant: "destructive",
      });
    }
  };

  const handleTextChange = (value: string) => {
    setTranscriptText(value);
    if (value && transcriptFile) {
      setTranscriptFile(null); // Clear file when text is entered
    }
  };

  const handleGenerateSummary = () => {
    if (!transcriptText.trim()) {
      toast({
        title: "Error",
        description: "Please upload a file or paste transcript text",
        variant: "destructive",
      });
      return;
    }

    generateSummaryMutation.mutate({
      transcript: transcriptText,
      customInstruction: customInstruction || undefined,
    });
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientEmail || !summary) {
      toast({
        title: "Error",
        description: "Please fill in recipient email and ensure summary is generated",
        variant: "destructive",
      });
      return;
    }

    sendEmailMutation.mutate({
      recipient: recipientEmail,
      subject: emailSubject,
      message: emailMessage || undefined,
      summary,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">AI Meeting Summarizer & Sharer</h1>
          <p className="text-gray-600 mt-1">Transform meeting transcripts into clear, actionable summaries</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Transcript Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Meeting Transcript</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Upload Transcript File</Label>
              <FileUpload onFileSelect={handleFileSelect} />
            </div>

            <div>
              <Label htmlFor="transcript-text" className="text-sm font-medium text-gray-700 mb-2">
                Or Paste Transcript Text
              </Label>
              <Textarea
                id="transcript-text"
                rows={8}
                placeholder="Paste your meeting transcript here..."
                value={transcriptText}
                onChange={(e) => handleTextChange(e.target.value)}
                className="resize-vertical"
              />
            </div>
          </CardContent>
        </Card>

        {/* Custom Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Custom Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="custom-instruction" className="text-sm font-medium text-gray-700 mb-2">
              Tell the AI how you'd like the summary formatted
            </Label>
            <Textarea
              id="custom-instruction"
              rows={3}
              placeholder="Example: Create a summary with action items, key decisions, and next steps. Format as bullet points."
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              className="resize-vertical"
            />
            <p className="mt-2 text-sm text-gray-500">Leave blank for a standard meeting summary format</p>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="mb-6">
          <Button
            onClick={handleGenerateSummary}
            disabled={generateSummaryMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
            size="lg"
          >
            {generateSummaryMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Summary"
            )}
          </Button>
        </div>

        {/* Summary Display */}
        {showSummary && (
          <Card id="summary-section" className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Summary</CardTitle>
                <span className="text-sm text-gray-500">Click to edit</span>
              </div>
            </CardHeader>
            <CardContent>
              <div
                contentEditable
                className="min-h-32 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent prose max-w-none"
                dangerouslySetInnerHTML={{ __html: summary }}
                onInput={(e) => setSummary(e.currentTarget.innerHTML)}
              />
              <p className="mt-2 text-sm text-gray-500">Summary is editable. Make any changes needed before sharing.</p>
            </CardContent>
          </Card>
        )}

        {/* Email Sharing */}
        {showSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Share Summary via Email</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipient-email">Recipient Email</Label>
                    <Input
                      id="recipient-email"
                      type="email"
                      required
                      placeholder="recipient@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email-subject">Subject</Label>
                    <Input
                      id="email-subject"
                      type="text"
                      placeholder="Meeting Summary"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email-message">Additional Message (Optional)</Label>
                  <Textarea
                    id="email-message"
                    rows={3}
                    placeholder="Add a personal message to include with the summary..."
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="resize-vertical"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={sendEmailMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                  size="lg"
                >
                  {sendEmailMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Summary"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">AI Meeting Summarizer & Sharer</p>
        </div>
      </footer>
    </div>
  );
}
