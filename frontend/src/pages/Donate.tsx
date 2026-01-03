import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, X, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { donatedItemsAPI, itemsAPI, uploadAPI } from "@/services/api";

const categories = ["Electronics", "Furniture", "Books", "Clothing", "Sports", "Other"];
const conditions = ["new", "like new", "good", "fair"];
const locations = [
  "Block A",
  "Block B",
  "Block C",
  "Hostel Block A",
  "Hostel Block B",
  "Hostel Block C",
  "Library Building",
  "Sports Complex",
  "Main Gate Area",
  "Cafeteria",
];

const Donate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    quantity: 1,
    location: "",
    anonymity: "public",
    isDonation: true,
    askingPrice: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    else if (formData.description.length < 50) newErrors.description = "Description must be at least 50 characters";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.condition) newErrors.condition = "Condition is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.isDonation && !formData.askingPrice) newErrors.askingPrice = "Asking price is required for selling items";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let imageUrl = null;

      // Upload image if selected
      if (selectedImage) {
        try {
          const uploadResult = await uploadAPI.uploadImage(selectedImage);
          imageUrl = uploadResult.imageUrl;
        } catch (uploadError: any) {
          console.error('Image upload failed:', uploadError);
          toast({
            title: "Image upload failed",
            description: uploadError.message || "Failed to upload image. Please try again or post without an image.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }

      if (formData.isDonation) {
        // Post as donation item
        await donatedItemsAPI.create({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          condition: formData.condition,
          quantity: formData.quantity,
          pickup_location: formData.location,
          is_anonymous: formData.anonymity === 'anonymous',
          image_urls: imageUrl ? [imageUrl] : []
        });
      } else {
        // Post as marketplace item
        await itemsAPI.create({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          condition: formData.condition,
          location: formData.location,
          asking_price: parseFloat(formData.askingPrice),
          image_urls: imageUrl ? [imageUrl] : []
        });
      }

      toast({
        title: "Item posted successfully!",
        description: formData.isDonation 
          ? "Your donation is now visible to the community." 
          : "Your item is now listed for sale.",
      });

      navigate("/explore");
    } catch (error: any) {
      console.error('Post item error:', error);
      toast({
        title: "Failed to post item",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    const baseValid = formData.title.trim() &&
      formData.description.length >= 50 &&
      formData.category &&
      formData.condition &&
      formData.location;
    
    if (formData.isDonation) {
      return baseValid;
    } else {
      return baseValid && formData.askingPrice;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-muted">
      <Navbar isAuthenticated={true} />

      <main className="pt-24 pb-16">
        <div className="container px-4 max-w-2xl">
          {/* Header */}
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>

          {/* Form Card */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Post Your Item
              </h1>
              <p className="text-muted-foreground">
                Share items with the community - donate or sell!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Item Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description * <span className="text-muted-foreground text-xs">(min. 50 characters)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item in detail. Include any important information like brand, size, condition details, etc."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className={`min-h-[120px] ${errors.description ? "border-destructive" : ""}`}
                />
                <div className="flex justify-between text-xs">
                  {errors.description ? (
                    <p className="text-destructive">{errors.description}</p>
                  ) : (
                    <span></span>
                  )}
                  <span className={`${formData.description.length < 50 ? "text-muted-foreground" : "text-secondary"}`}>
                    {formData.description.length} / 50 min
                  </span>
                </div>
              </div>

              {/* Category & Condition */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => handleChange("category", v)}>
                    <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Condition *</Label>
                  <Select value={formData.condition} onValueChange={(v) => handleChange("condition", v)}>
                    <SelectTrigger className={errors.condition ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((cond) => (
                        <SelectItem key={cond} value={cond}>
                          {cond}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.condition && (
                    <p className="text-sm text-destructive">{errors.condition}</p>
                  )}
                </div>
              </div>

              {/* Quantity & Location */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pickup Location *</Label>
                  <Select value={formData.location} onValueChange={(v) => handleChange("location", v)}>
                    <SelectTrigger className={errors.location ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location}</p>
                  )}
                </div>
              </div>

              {/* Item Type - Donation or Sell */}
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <Label>Item Type *</Label>
                <RadioGroup
                  value={formData.isDonation ? "donation" : "sell"}
                  onValueChange={(v) => handleChange("isDonation", v === "donation")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="donation" id="donation" />
                    <Label htmlFor="donation" className="font-normal cursor-pointer">
                      Free Donation
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sell" id="sell" />
                    <Label htmlFor="sell" className="font-normal cursor-pointer">
                      Sell Item
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Asking Price - Only show if selling */}
              {!formData.isDonation && (
                <div className="space-y-2">
                  <Label htmlFor="askingPrice">Asking Price (₹) *</Label>
                  <Input
                    id="askingPrice"
                    type="number"
                    min={0}
                    placeholder="Enter asking price in rupees"
                    value={formData.askingPrice}
                    onChange={(e) => handleChange("askingPrice", e.target.value)}
                    className={errors.askingPrice ? "border-destructive" : ""}
                  />
                  {errors.askingPrice && (
                    <p className="text-sm text-destructive">{errors.askingPrice}</p>
                  )}
                </div>
              )}

              {/* Anonymity */}
              <div className="space-y-3">
                <Label>Privacy Setting</Label>
                <RadioGroup
                  value={formData.anonymity}
                  onValueChange={(v) => handleChange("anonymity", v)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="font-normal cursor-pointer">
                      Public (show my name)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="anonymous" id="anonymous" />
                    <Label htmlFor="anonymous" className="font-normal cursor-pointer">
                      Anonymous (hide my identity)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Upload Image</Label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center transition-all
                    ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
                    ${imagePreview ? "p-4" : ""}
                  `}
                >
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-foreground font-medium mb-1">
                        Drag and drop your image here
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        or click to browse
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/explore")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {formData.isDonation ? 'Post Donation' : 'Post Item'}
                    </>
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

export default Donate;
