import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Upload, X, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { concernsAPI } from "@/services/api";

const concernTypes = [
  "Inappropriate Item",
  "User Behavior",
  "Scam/Fraud",
  "Spam",
  "Technical Issue",
  "Other",
];

const urgencyLevels = ["Low", "Medium", "High", "Critical"];

const RaiseConcern = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [concernId, setConcernId] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    userInQuestion: "",
    itemInvolved: "",
    description: "",
    urgency: "Medium",
    contactMethod: "email",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Each image must be smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.type) newErrors.type = "Please select a concern type";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    else if (formData.description.length < 50) newErrors.description = "Please provide more details (min 50 characters)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Map frontend concern types to backend expected values
      const concernTypeMap: Record<string, string> = {
        "Inappropriate Item": "item",
        "User Behavior": "user",
        "Scam/Fraud": "user",
        "Spam": "item",
        "Technical Issue": "technical",
        "Other": "general"
      };

      const response = await concernsAPI.create({
        title: formData.title,
        description: formData.description,
        concernType: concernTypeMap[formData.type] || "general",
        priority: formData.urgency.toLowerCase(),
        image_urls: []
      });

      const newConcernId = `RC${response.concern.id}`;
      setConcernId(newConcernId);
      setIsSuccess(true);
    } catch (error: any) {
      toast({
        title: "Failed to submit concern",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted via-background to-muted">
        <Navbar isAuthenticated={true} />
        <main className="pt-24 pb-16">
          <div className="container px-4 max-w-md mx-auto text-center">
            <div className="bg-card rounded-2xl p-8 shadow-elevated animate-scale-in">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-secondary" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Concern Submitted!
              </h1>
              <p className="text-muted-foreground mb-4">
                Your concern ID is: <strong className="text-foreground">{concernId}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Our team will review your concern within 24-48 hours. You'll receive an update via email.
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate("/dashboard")} className="w-full">
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate("/explore")} className="w-full">
                  Back to Explore
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-muted">
      <Navbar isAuthenticated={true} />

      <main className="pt-24 pb-16">
        <div className="container px-4 max-w-2xl">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Raise a Concern
                </h1>
                <p className="text-muted-foreground">
                  Help us maintain a safe community
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Concern Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Concern Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief title for your concern"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              {/* Concern Type */}
              <div className="space-y-2">
                <Label>Concern Type *</Label>
                <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
                  <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select type of concern" />
                  </SelectTrigger>
                  <SelectContent>
                    {concernTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
              </div>

              {/* Optional Fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userInQuestion">User in Question (optional)</Label>
                  <Input
                    id="userInQuestion"
                    placeholder="Username or email"
                    value={formData.userInQuestion}
                    onChange={(e) => handleChange("userInQuestion", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemInvolved">Item Involved (optional)</Label>
                  <Input
                    id="itemInvolved"
                    placeholder="Item title or ID"
                    value={formData.itemInvolved}
                    onChange={(e) => handleChange("itemInvolved", e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide a detailed explanation of your concern..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className={`min-h-[150px] ${errors.description ? "border-destructive" : ""}`}
                />
                <div className="flex justify-between text-xs">
                  {errors.description ? (
                    <p className="text-destructive">{errors.description}</p>
                  ) : (
                    <span></span>
                  )}
                  <span className="text-muted-foreground">{formData.description.length} characters</span>
                </div>
              </div>

              {/* Urgency */}
              <div className="space-y-2">
                <Label>Urgency Level</Label>
                <Select value={formData.urgency} onValueChange={(v) => handleChange("urgency", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Preference */}
              <div className="space-y-3">
                <Label>Preferred Contact Method</Label>
                <RadioGroup
                  value={formData.contactMethod}
                  onValueChange={(v) => handleChange("contactMethod", v)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email" className="font-normal cursor-pointer">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone" className="font-normal cursor-pointer">Phone</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Evidence Upload */}
              <div className="space-y-2">
                <Label>Upload Evidence (optional)</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop images or click to browse
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="evidence-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("evidence-upload")?.click()}
                    >
                      Choose Files
                    </Button>
                  </div>
                </div>
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative">
                        <img src={img} alt={`Evidence ${index + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Concern"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RaiseConcern;
