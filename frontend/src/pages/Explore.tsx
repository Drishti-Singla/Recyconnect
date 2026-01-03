import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  User, 
  MessageCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package
} from "lucide-react";
import { donatedItemsAPI, itemsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const categories = ["All", "Electronics", "Furniture", "Books", "Clothing", "Sports", "Stationery", "Other"];
const conditions = ["All", "Excellent", "Good", "Fair", "Poor"];
const locations = ["All", "Donation Box", "Block A", "Block B", "Block C", "Hostel", "Library", "Sports Complex", "Main Gate"];

const Explore = () => {
  const { toast } = useToast();
  const [donatedItems, setDonatedItems] = useState<any[]>([]);
  const [lostFoundItems, setLostFoundItems] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const [donatedData, lostFoundData] = await Promise.all([
        donatedItemsAPI.getAll().catch(() => ({ donatedItems: [] })),
        itemsAPI.getAll().catch(() => ({ items: [] }))
      ]);
      
      const donated = (donatedData.donatedItems || []).map((item: any) => ({
        ...item,
        type: 'donated',
        itemType: 'Donated Item',
        image_urls: Array.isArray(item.image_urls) ? item.image_urls : (item.image_urls ? [item.image_urls] : [])
      }));
      
      const lostFound = (lostFoundData.items || []).map((item: any) => ({
        ...item,
        type: 'marketplace',
        itemType: 'Marketplace Item',
        pickup_location: item.location,
        image_urls: Array.isArray(item.image_urls) ? item.image_urls : (item.image_urls ? [item.image_urls] : [])
      }));
      
      setDonatedItems(donated);
      setLostFoundItems(lostFound);
      setItems([...donated, ...lostFound]);
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

  const filteredItems = items.filter((item) => {
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = searchLower === '' || 
      (item.title && item.title.toLowerCase().includes(searchLower)) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      (item.category && item.category.toLowerCase().includes(searchLower));
    
    const matchesCategory = selectedCategory === "All" || 
      (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
    
    const matchesCondition = selectedCondition === "All" || 
      (item.condition && item.condition.toLowerCase() === selectedCondition.toLowerCase());
    
    const matchesLocation = selectedLocation === "All" || 
      (item.pickup_location && item.pickup_location.toLowerCase().includes(selectedLocation.toLowerCase()));
    
    return matchesSearch && matchesCategory && matchesCondition && matchesLocation;
  });

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedCondition("All");
    setSelectedLocation("All");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedCategory !== "All" || selectedCondition !== "All" || selectedLocation !== "All" || searchQuery;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={true} />
        <main className="pt-24 pb-16">
          <div className="container px-4 flex justify-center items-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} />
      
      <main className="pt-24 pb-16">
        <div className="container px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Explore Items
              </h1>
              <p className="text-muted-foreground">
                Discover items available in your community ({items.length} total)
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/donate">
                <Button size="lg" className="w-full sm:w-auto">
                  <Package className="w-4 h-4 mr-2" />
                  Post Item
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-card rounded-2xl p-4 md:p-6 shadow-card mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Toggle (Mobile) */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    Active
                  </Badge>
                )}
              </Button>

              {/* Desktop Filters */}
              <div className="hidden md:flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue>
                      {selectedCategory === "All" ? "Category: All" : `Category: ${selectedCategory}`}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue>
                      {selectedCondition === "All" ? "Condition: All" : `Condition: ${selectedCondition}`}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((cond) => (
                      <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      {selectedLocation === "All" ? "Location: All" : `Location: ${selectedLocation}`}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="md:hidden mt-4 space-y-3 pt-4 border-t">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((cond) => (
                      <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
            </p>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No items found</h3>
              <p className="text-muted-foreground mb-6">
                {hasActiveFilters ? "Try adjusting your filters" : "Be the first to donate an item!"}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => setSelectedItem(item)}
                  className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-all cursor-pointer group"
                >
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {item.image_urls && item.image_urls.length > 0 ? (
                      <img
                        src={item.image_urls[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3" variant={item.type === 'donated' ? 'default' : 'secondary'}>
                      {item.itemType}
                    </Badge>
                    {item.condition && (
                      <Badge className="absolute top-3 right-3">{item.condition}</Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground flex-1 min-w-0">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">{item.pickup_location || 'Unknown'}</span>
                      </div>
                      {item.type === 'marketplace' && (
                        <span className={`font-semibold whitespace-nowrap ${
                          item.asking_price ? 'text-primary' : 'text-muted-foreground text-xs'
                        }`}>
                          {item.asking_price ? `₹${item.asking_price}` : 'Price not set'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
            <DialogDescription>
              View detailed information about this item
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              {/* Image */}
              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                {selectedItem.image_urls && selectedItem.image_urls.length > 0 ? (
                  <>
                    <img
                      src={selectedItem.image_urls[currentImageIndex] || selectedItem.image_urls[0]}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                    {selectedItem.image_urls.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {selectedItem.image_urls.map((_: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              idx === currentImageIndex ? 'bg-primary' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Description</h4>
                  <p className="text-foreground">{selectedItem.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Category</h4>
                    <Badge>{selectedItem.category}</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Condition</h4>
                    <Badge variant="secondary">{selectedItem.condition}</Badge>
                  </div>
                </div>

                {selectedItem.type === 'marketplace' && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Asking Price</h4>
                    {selectedItem.asking_price ? (
                      <p className="text-2xl font-bold text-primary">₹{selectedItem.asking_price}</p>
                    ) : (
                      <p className="text-muted-foreground italic">Price not set</p>
                    )}
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Location</h4>
                  <div className="flex items-center gap-2 text-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedItem.pickup_location || 'Not specified'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Posted By</h4>
                  <div className="flex items-center gap-2 text-foreground">
                    <User className="w-4 h-4" />
                    <span>{selectedItem.anonymity === 'anonymous' ? 'Anonymous' : selectedItem.username || 'User'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {selectedItem.type === 'donated' ? 'Message Donor' : 'Message Seller'}
                </Button>
                <Button variant="outline">
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Explore;