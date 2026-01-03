import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  MapPin, 
  Calendar,
  Package,
  Upload,
  X,
  Eye,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reportedItemsAPI } from "@/services/api";

const categories = ["Keys", "Phone", "Wallet", "Electronics", "Clothing", "Other"];
const locations = ["Block A", "Block B", "Block C", "Hostel", "Library Building", "Sports Complex", "Cafeteria", "Main Gate"];

const LostFound = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"view" | "report">("view");
  const [itemType, setItemType] = useState<"lost" | "found">("lost");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterLocation, setFilterLocation] = useState("All");
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [reportForm, setReportForm] = useState({
    type: "lost",
    title: "",
    category: "",
    description: "",
    location: "",
    date: "",
    contactPreference: "chat",
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await reportedItemsAPI.getAll();
      setItems(data.reportedItems || []);
    } catch (error: any) {
      toast({
        title: "Failed to load items",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Lost":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "Found":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "Reunited":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "";
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || item.category === filterCategory;
    const matchesLocation = filterLocation === "All" || item.location === filterLocation;
    const isNotResolved = item.status !== "resolved" && item.status !== "reunited";
    return matchesSearch && matchesCategory && matchesLocation && isNotResolved;
  });

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const itemData = {
        title: reportForm.title,
        description: reportForm.description,
        category: reportForm.category,
        location: reportForm.location,
        report_type: reportForm.type,
        date_lost_found: reportForm.date || new Date().toISOString().split('T')[0],
        image_urls: imagePreview ? [imagePreview] : []
      };
      
      await reportedItemsAPI.create(itemData);
      
      toast({
        title: "Report submitted successfully!",
        description: "We'll notify you when there's an update.",
      });
      
      // Reload items to show the new post
      await loadItems();
      
      setActiveTab("view");
      setReportForm({
        type: "lost",
        title: "",
        category: "",
        description: "",
        location: "",
        date: "",
        contactPreference: "chat",
      });
      setImagePreview(null);
      
      loadItems();
    } catch (error: any) {
      toast({
        title: "Failed to submit report",
        description: error.message,
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
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Lost & Found
            </h1>
            <p className="text-muted-foreground">
              Report lost items or help reunite found items with their owners
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="view">View Lost & Found</TabsTrigger>
              <TabsTrigger value="report">Report Lost/Found</TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="animate-fade-in">
              {/* Filters */}
              <div className="bg-card rounded-xl p-4 shadow-card mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search lost & found items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="w-full md:w-[150px]">
                    <Label className="text-xs text-muted-foreground mb-1">Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full md:w-[150px]">
                    <Label className="text-xs text-muted-foreground mb-1">Location</Label>
                    <Select value={filterLocation} onValueChange={setFilterLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Locations</SelectItem>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Items Grid */}
              {filteredItems.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : '/placeholder.png'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <Badge className={`absolute top-3 right-3 ${item.report_type === 'lost' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-secondary/10 text-secondary border-secondary/20'}`}>
                          {item.report_type === 'lost' ? 'Lost' : 'Found'}
                        </Badge>
                      </div>
                      <div className="p-5">
                        <h3 className="font-display font-semibold text-lg text-foreground mb-3">
                          {item.title}
                        </h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{item.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{item.date_lost_found ? new Date(item.date_lost_found).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1"
                            onClick={() => setSelectedItem(item)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          {item.report_type === "lost" && (
                            <Button variant="secondary">
                              I Found This
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    No items found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="report" className="animate-fade-in">
              <div className="bg-card rounded-xl p-6 md:p-8 shadow-elevated max-w-xl mx-auto">
                <form onSubmit={handleReportSubmit} className="space-y-6">
                  {/* Report Type */}
                  <div className="space-y-2">
                    <Label>Report Type</Label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={reportForm.type === "lost" ? "default" : "outline"}
                        onClick={() => setReportForm((p) => ({ ...p, type: "lost" }))}
                        className="flex-1"
                      >
                        Lost Item
                      </Button>
                      <Button
                        type="button"
                        variant={reportForm.type === "found" ? "secondary" : "outline"}
                        onClick={() => setReportForm((p) => ({ ...p, type: "found" }))}
                        className="flex-1"
                      >
                        Found Item
                      </Button>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Item Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Black Wallet, iPhone 14"
                      value={reportForm.title}
                      onChange={(e) => setReportForm((p) => ({ ...p, title: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={reportForm.category}
                      onValueChange={(v) => setReportForm((p) => ({ ...p, category: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide detailed description to help identify the item..."
                      value={reportForm.description}
                      onChange={(e) => setReportForm((p) => ({ ...p, description: e.target.value }))}
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  {/* Location & Date */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Location *</Label>
                      <Select
                        value={reportForm.location}
                        onValueChange={(v) => setReportForm((p) => ({ ...p, location: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Where was it?" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((loc) => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={reportForm.date}
                        onChange={(e) => setReportForm((p) => ({ ...p, date: e.target.value }))}
                        max={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Preference */}
                  <div className="space-y-2">
                    <Label>Contact Preference</Label>
                    <Select
                      value={reportForm.contactPreference}
                      onValueChange={(v) => setReportForm((p) => ({ ...p, contactPreference: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chat">Chat</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Upload Image (Optional)</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg" />
                          <button
                            type="button"
                            onClick={() => setImagePreview(null)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click or drag to upload
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setImagePreview(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </>
                      )}
                    </div>
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
                        Submit Report
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {selectedItem.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full aspect-video object-cover rounded-xl"
                />
                <div className="flex gap-2">
                  <Badge className={getStatusColor(selectedItem.status)}>
                    {selectedItem.status}
                  </Badge>
                  <Badge variant="outline">{selectedItem.category}</Badge>
                </div>
                <p className="text-foreground">{selectedItem.description}</p>
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedItem.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{new Date(selectedItem.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button className="w-full">Contact Poster</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default LostFound;
