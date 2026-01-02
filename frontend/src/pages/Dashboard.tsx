import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Package,
  Search,
  Flag,
  MessageCircle,
  Settings,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Bell,
  Lock,
  LogOut,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { donatedItemsAPI, itemsAPI, concernsAPI, messagesAPI, authAPI, reportedItemsAPI } from "@/services/api";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<any[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);
  const [reportedItems, setReportedItems] = useState<any[]>([]);
  const [concerns, setConcerns] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newMessages: true,
    itemClaimed: true,
  });

  useEffect(() => {
    // Check if user is admin and redirect to admin panel
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
          navigate("/admin");
          return;
        }
        // Load user profile data from sessionStorage
        setProfileData({
          name: user.name || user.username || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      } catch (error) {
        console.error("Error parsing user data", error);
      }
    }
    
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [donationsData, marketplaceData, reportedData, concernsData, messagesData] = await Promise.all([
        donatedItemsAPI.getUserDonations().catch(() => ({ donatedItems: [] })),
        itemsAPI.getUserItems().catch(() => ({ items: [] })),
        reportedItemsAPI.getUserReportedItems().catch(() => ({ reportedItems: [] })),
        concernsAPI.getUserConcerns().catch(() => ({ concerns: [] })),
        messagesAPI.getConversations().catch(() => ({ conversations: [] }))
      ]);
      setDonations(donationsData.donatedItems || []);
      setMarketplaceItems(marketplaceData.items || []);
      setReportedItems(reportedData.reportedItems || []);
      setConcerns(concernsData.concerns || []);
      setMessages(messagesData.conversations || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDonation = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await donatedItemsAPI.delete(itemId);
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      loadDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLostReport = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await reportedItemsAPI.delete(itemId);
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
      loadDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMarketplaceItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await itemsAPI.delete(itemId);
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      loadDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleViewItem = (item: any) => {
    // Navigate to explore page or show item details
    navigate('/explore');
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setEditFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      location: item.location || item.pickup_location || '',
      condition: item.condition || '',
      status: item.status,
      asking_price: item.asking_price || '',
      report_type: item.report_type || '',
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      const updates: any = {
        title: editFormData.title,
        description: editFormData.description,
        category: editFormData.category,
        status: editFormData.status,
      };

      // Add type-specific fields
      if (editingItem.type === 'donated') {
        updates.pickup_location = editFormData.location;
        updates.condition = editFormData.condition;
        await donatedItemsAPI.updateStatus(editingItem.id, updates);
      } else if (editingItem.type === 'marketplace') {
        updates.location = editFormData.location;
        updates.condition = editFormData.condition;
        updates.asking_price = editFormData.asking_price;
        await itemsAPI.updateStatus(editingItem.id, updates);
      } else if (editingItem.report_type) {
        // Lost & Found item
        updates.location = editFormData.location;
        updates.report_type = editFormData.report_type;
        await reportedItemsAPI.updateStatus(editingItem.id, updates);
      }

      toast({
        title: "Success",
        description: "Item updated successfully",
      });
      setShowEditDialog(false);
      setEditingItem(null);
      loadDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
      case "Pending":
        return "bg-secondary/10 text-secondary";
      case "Claimed":
      case "Resolved":
      case "Reunited":
        return "bg-primary/10 text-primary";
      case "Under Review":
        return "bg-yellow-500/10 text-yellow-600";
      case "Lost":
        return "bg-destructive/10 text-destructive";
      default:
        return "";
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await authAPI.updateProfile({
        username: profileData.name,
        phone: profileData.phone,
      });
      
      // Update sessionStorage with new data from API response
      const userStr = sessionStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.username = response.user.username;
        user.name = response.user.username; // Keep both for compatibility
        user.phone = response.user.phone;
        sessionStorage.setItem("user", JSON.stringify(user));
      }
      
      // Update local state to reflect in sidebar immediately
      setProfileData(prev => ({
        ...prev,
        name: response.user.username,
        phone: response.user.phone
      }));
      
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const sidebarItems = [
    { id: "profile", icon: User, label: "Profile" },
    { id: "items", icon: Package, label: "My Items" },
    { id: "lostfound", icon: Search, label: "Lost & Found" },
    { id: "concerns", icon: Flag, label: "My Concerns" },
    { id: "messages", icon: MessageCircle, label: "Messages" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  // Combine donations and marketplace items with type labels
  const allItems = [
    ...donations.map(item => ({ ...item, itemType: 'Donated Item', type: 'donated', isFree: true })),
    ...marketplaceItems.map(item => ({ ...item, itemType: 'Marketplace Item', type: 'marketplace', isFree: false }))
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar isAuthenticated={true} />

      <main className="pt-20">
        <div className="container px-4 py-8">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>

          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar */}
            <div className="bg-card rounded-xl p-4 shadow-card h-fit">
              <div className="text-center p-4 border-b border-border mb-4">
                <Avatar className="w-20 h-20 mx-auto mb-3">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {profileData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-display font-semibold text-lg">{profileData.name}</h2>
                <p className="text-sm text-muted-foreground">{profileData.email}</p>
              </div>
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {item.id === "messages" && messages.reduce((sum, msg) => sum + (msg.unread_count || 0), 0) > 0 && (
                      <Badge className="ml-auto" variant="secondary">
                        {messages.reduce((sum, msg) => sum + (msg.unread_count || 0), 0)}
                      </Badge>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="bg-card rounded-xl p-6 shadow-card">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl font-bold">My Profile</h2>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    >
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Display Name</Label>
                        <Input
                          value={profileData.name}
                          onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={profileData.email} disabled />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-8 pt-6 border-t border-border">
                      <h3 className="font-display font-semibold mb-4">Change Password</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Current Password</Label>
                          <Input type="password" placeholder="••••••••" />
                        </div>
                        <div className="space-y-2">
                          <Label>New Password</Label>
                          <Input type="password" placeholder="••••••••" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* My Items Tab - Combined Donations & Marketplace */}
              {activeTab === "items" && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl font-bold">My Items</h2>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Total: <strong className="text-foreground">{allItems.length}</strong></span>
                      <span>Donated: <strong className="text-secondary">{donations.length}</strong></span>
                      <span>Marketplace: <strong className="text-primary">{marketplaceItems.length}</strong></span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      </div>
                    ) : allItems.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">No items yet</h3>
                        <p className="text-muted-foreground mb-4">Start by posting your first item!</p>
                        <Button onClick={() => navigate('/donate')}>Post an Item</Button>
                      </div>
                    ) : allItems.map((item) => (
                      <div key={`${item.type}-${item.id}`} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl relative">
                        {/* Item Type Badge */}
                        <Badge 
                          className="absolute top-2 left-2 z-10"
                          variant={item.isFree ? "secondary" : "default"}
                        >
                          {item.isFree ? "Donated" : "For Sale"}
                        </Badge>
                        
                        {item.image_urls && item.image_urls.length > 0 ? (
                          <img src={item.image_urls[0]} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                        ) : (
                          <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                          <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{item.itemType}</span>
                            {!item.isFree && item.asking_price && (
                              <span>• ₹{item.asking_price}</span>
                            )}
                            {item.location && (
                              <span>• {item.location || item.pickup_location}</span>
                            )}
                          </div>
                        </div>
                        
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewItem(item)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive" 
                            onClick={() => item.type === 'donated' ? handleDeleteDonation(item.id) : handleDeleteMarketplaceItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lost & Found Tab */}
              {activeTab === "lostfound" && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl font-bold">Lost & Found</h2>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Total: <strong className="text-foreground">{reportedItems.length}</strong></span>
                      <span>Lost: <strong className="text-destructive">{reportedItems.filter(i => i.report_type === 'lost').length}</strong></span>
                      <span>Found: <strong className="text-secondary">{reportedItems.filter(i => i.report_type === 'found').length}</strong></span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      </div>
                    ) : reportedItems.length === 0 ? (
                      <div className="text-center py-12">
                        <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">No reports yet</h3>
                        <p className="text-muted-foreground mb-4">Report lost or found items to help the community!</p>
                        <Button onClick={() => navigate('/lostfound')}>Report an Item</Button>
                      </div>
                    ) : reportedItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl relative">
                        {/* Report Type Badge */}
                        <Badge 
                          className="absolute top-2 left-2 z-10"
                          variant={item.report_type === 'lost' ? "destructive" : "secondary"}
                        >
                          {item.report_type === 'lost' ? "Lost" : "Found"}
                        </Badge>
                        
                        {item.image_urls && item.image_urls.length > 0 ? (
                          <img src={item.image_urls[0]} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                        ) : (
                          <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                            <Search className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                          <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{item.location}</span>
                            {item.date_lost_found && (
                              <span>• {new Date(item.date_lost_found).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewItem(item)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive" 
                            onClick={() => handleDeleteLostReport(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Concerns Tab */}
              {activeTab === "concerns" && (
                <div className="animate-fade-in">
                  <h2 className="font-display text-2xl font-bold mb-6">My Concerns</h2>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      </div>
                    ) : concerns.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No concerns yet</p>
                    ) : concerns.map((concern) => (
                      <div key={concern.id} className="p-4 bg-muted/50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{concern.title}</h3>
                          <Badge className={getStatusColor(concern.status)}>{concern.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          ID: {concern.id} • Submitted on {new Date(concern.date).toLocaleDateString()}
                        </p>
                        {concern.response && (
                          <div className="mt-3 p-3 bg-card rounded-lg border border-border">
                            <p className="text-sm font-medium mb-1">Admin Response:</p>
                            <p className="text-sm text-muted-foreground">{concern.response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === "messages" && (
                <div className="animate-fade-in">
                  <h2 className="font-display text-2xl font-bold mb-6">Messages</h2>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">No messages yet</h3>
                      <p className="text-muted-foreground">Start a conversation by messaging item owners!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((msg) => (
                        <button
                          key={msg.other_user_id}
                          className="w-full flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left"
                        >
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {msg.username?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{msg.username || 'Unknown User'}</h3>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.last_message_time).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{msg.last_message}</p>
                          </div>
                          {msg.unread_count > 0 && (
                            <Badge className="bg-primary text-primary-foreground">{msg.unread_count}</Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="animate-fade-in">
                  <h2 className="font-display text-2xl font-bold mb-6">Settings</h2>

                  <div className="space-y-8">
                    {/* Notifications */}
                    <div>
                      <h3 className="font-semibold flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5" />
                        Notification Preferences
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(notifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <Label htmlFor={key} className="font-normal capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Label>
                            <Switch
                              id={key}
                              checked={value}
                              onCheckedChange={(checked) =>
                                setNotifications((p) => ({ ...p, [key]: checked }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Privacy */}
                    <div>
                      <h3 className="font-semibold flex items-center gap-2 mb-4">
                        <Lock className="w-5 h-5" />
                        Privacy Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="font-normal">Show profile to others</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="font-normal">Allow direct messages</Label>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    {/* Account Actions */}
                    <div className="pt-6 border-t border-border">
                      <h3 className="font-semibold mb-4">Account Actions</h3>
                      <div className="flex flex-wrap gap-4">
                        <Button variant="outline">
                          <LogOut className="w-4 h-4 mr-2" />
                          Deactivate Account
                        </Button>
                        <Button variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update the details of your item below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editFormData.title || ''}
                onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={editFormData.category || ''}
                  onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Input
                  value={editFormData.status || ''}
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={editFormData.location || ''}
                onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
              />
            </div>

            {editFormData.condition !== undefined && (
              <div className="space-y-2">
                <Label>Condition</Label>
                <Input
                  value={editFormData.condition || ''}
                  onChange={(e) => setEditFormData({...editFormData, condition: e.target.value})}
                />
              </div>
            )}

            {editFormData.asking_price !== undefined && editingItem?.type === 'marketplace' && (
              <div className="space-y-2">
                <Label>Asking Price (₹)</Label>
                <Input
                  type="number"
                  value={editFormData.asking_price || ''}
                  onChange={(e) => setEditFormData({...editFormData, asking_price: e.target.value})}
                />
              </div>
            )}

            {editFormData.report_type !== undefined && (
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Input
                  value={editFormData.report_type || ''}
                  onChange={(e) => setEditFormData({...editFormData, report_type: e.target.value})}
                  disabled
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
