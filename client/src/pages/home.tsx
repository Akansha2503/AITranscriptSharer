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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                AI Meeting Summarizer
              </h1>
              <p className="text-slate-600 mt-1 text-lg">Transform meeting transcripts into professional, actionable summaries</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Transcript Input */}
        <Card className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <CardTitle className="text-xl font-semibold text-slate-800">Meeting Transcript</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">Upload Transcript File</Label>
              <FileUpload onFileSelect={handleFileSelect} />
            </div>

            <div className="relative">
              <Label htmlFor="transcript-text" className="text-sm font-semibold text-slate-700 mb-3 block">
                Or Paste Transcript Text
              </Label>
              <Textarea
                id="transcript-text"
                rows={8}
                placeholder="Paste your meeting transcript here..."
                value={transcriptText}
                onChange={(e) => handleTextChange(e.target.value)}
                className="resize-vertical border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Custom Instructions */}
        <Card className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <CardTitle className="text-xl font-semibold text-slate-800">Custom Instructions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Label htmlFor="custom-instruction" className="text-sm font-semibold text-slate-700 mb-3 block">
              Tell the AI how you'd like the summary formatted
            </Label>
            <Textarea
              id="custom-instruction"
              rows={3}
              placeholder="Example: Create a summary with action items, key decisions, and next steps. Format as bullet points."
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              className="resize-vertical border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg shadow-sm"
            />
            <p className="mt-3 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
              💡 Leave blank for a standard meeting summary format
            </p>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="mb-8">
          <Button
            onClick={handleGenerateSummary}
            disabled={generateSummaryMutation.isPending}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            size="lg"
          >
            {generateSummaryMutation.isPending ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate AI Summary
              </>
            )}
          </Button>
        </div>

        {/* Summary Display */}
        {showSummary && (
          <Card id="summary-section" className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-800">Generated Summary</CardTitle>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Click to edit
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                contentEditable
                className="min-h-32 p-6 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent prose max-w-none bg-slate-50 hover:bg-white transition-colors shadow-inner"
                dangerouslySetInnerHTML={{ __html: summary }}
                onInput={(e) => setSummary(e.currentTarget.innerHTML)}
              />
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 bg-green-50 p-3 rounded-lg border border-green-200">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Summary is editable. Make any changes needed before sharing.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Sharing */}
        {showSummary && (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Share Summary via Email</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendEmail} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipient-email" className="text-sm font-semibold text-slate-700 mb-2 block">Recipient Email</Label>
                    <Input
                      id="recipient-email"
                      type="email"
                      required
                      placeholder="recipient@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg shadow-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email-subject" className="text-sm font-semibold text-slate-700 mb-2 block">Subject</Label>
                    <Input
                      id="email-subject"
                      type="text"
                      placeholder="Meeting Summary"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg shadow-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email-message" className="text-sm font-semibold text-slate-700 mb-2 block">Additional Message (Optional)</Label>
                  <Textarea
                    id="email-message"
                    rows={3}
                    placeholder="Add a personal message to include with the summary..."
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="resize-vertical border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg shadow-sm"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={sendEmailMutation.isPending}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  size="lg"
                >
                  {sendEmailMutation.isPending ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Sending Email...
                    </>
                  ) : (
                    <>
                      <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Summary
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-slate-200 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium">AI Meeting Summarizer & Sharer</span>
            <span className="text-slate-400">•</span>
            <span className="text-sm text-slate-500">Powered by AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
