import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, CheckCircle, MessageSquare, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { concernsAPI } from "@/services/api";

const Feedback = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    feedback: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (value: string) => {
    setFormData({ feedback: value });
    if (errors.feedback) {
      setErrors({});
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Screenshot must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setScreenshot(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.feedback.trim()) newErrors.feedback = "Feedback is required";
    else if (formData.feedback.length < 10) newErrors.feedback = "Please provide more details (min 10 characters)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Create concern with feedback
      await concernsAPI.create({
        title: "User Feedback",
        description: formData.feedback + (screenshot ? "\n\n[Screenshot attached]" : ""),
        concernType: "general",
        priority: "medium",
        image_urls: []
      });

      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback. We'll review it soon!",
      });

      setFormData({ feedback: "" });
      setScreenshot(null);
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} />

      <main className="pt-24 pb-16">
        <div className="container px-4">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              We Value Your Feedback!
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Help us improve Recyconnect. Your feedback matters to us.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Feedback Form */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Feedback */}
                <div className="space-y-2">
                  <Label htmlFor="feedback">Your Feedback * <span className="text-muted-foreground text-xs">(min. 10 characters)</span></Label>
                  <Textarea
                    id="feedback"
                    placeholder="Share your thoughts, suggestions, or report issues..."
                    value={formData.feedback}
                    onChange={(e) => handleChange(e.target.value)}
                    className={`min-h-[200px] ${errors.feedback ? "border-destructive" : ""}`}
                  />
                  <div className="flex justify-between text-xs">
                    {errors.feedback ? (
                      <p className="text-destructive">{errors.feedback}</p>
                    ) : (
                      <span></span>
                    )}
                    <span className={formData.feedback.length >= 10 ? "text-secondary" : "text-muted-foreground"}>
                      {formData.feedback.length} / 10 min
                    </span>
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-2">
                  <Label>Attach Screenshot (optional)</Label>
                  {screenshot ? (
                    <div className="border-2 border-border rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{screenshot.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(screenshot.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setScreenshot(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        Click to upload screenshot
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, JPEG (max 5MB)
                      </p>
                    </label>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Feedback;
