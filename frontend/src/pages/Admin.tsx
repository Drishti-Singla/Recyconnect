import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Recycle,
  LayoutDashboard,
  Users,
  Package,
  Search,
  Flag,
  MessageCircle,
  Settings,
  LogOut,
  Eye,
  Ban,
  Trash2,
  Shield,
  TrendingUp,
  Clock,
  Activity,
  Loader2,
  User,
  Edit,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminAPI, donatedItemsAPI, concernsAPI, messagesAPI, itemsAPI, authAPI } from "@/services/api";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<"overview" | "users" | "donations" | "lostfound" | "concerns" | "messages" | "settings">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [concerns, setConcerns] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [lostFoundItems, setLostFoundItems] = useState<any[]>([]);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; type: string } | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageTarget, setMessageTarget] = useState<{ userId: number; username: string } | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [showConversationDialog, setShowConversationDialog] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<any[]>([]);
  const [conversationUser, setConversationUser] = useState<{ id: number; username: string } | null>(null);
  const [profileForm, setProfileForm] = useState({
    username: '',
    phone: '',
    address: '',
    bio: '',
    roll_number: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Check if user is admin
    const userStr = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");
    
    console.log('Admin useEffect - userStr:', userStr);
    console.log('Admin useEffect - token:', token);
    
    if (!userStr) {
      navigate("/login");
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      console.log('Admin useEffect - parsed user:', user);
      
      if (user.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel",
          variant: "destructive"
        });
        navigate("/explore");
        return;
      }
    } catch (error) {
      console.error('Admin useEffect - parse error:', error);
      navigate("/login");
      return;
    }
    
    // Initialize socket connection for real-time updates
    if (token) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const socketUrl = API_URL.replace('/api', '');
      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected for admin');
      });

      // Listen for new messages
      newSocket.on('new_message', (message) => {
        console.log('New message received:', message);
        // Reload messages to update the list
        messagesAPI.getConversations().then((data) => {
          setMessages(data.conversations || []);
        }).catch(console.error);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(newSocket);
    }
    
    loadAdminData();
    
    // Cleanup on unmount
    return () => {
      socket?.disconnect();
    };
  }, [navigate, toast]);

  const loadAdminData = async () => {
    console.log('loadAdminData() called - starting to fetch data...');
    try {
      setLoading(true);
      const [usersData, donationsData, concernsData, messagesData, itemsData] = await Promise.all([
        adminAPI.getAllUsers().catch((err) => {
          console.error('Failed to load users:', err);
          return { users: [] };
        }),
        donatedItemsAPI.getAll().catch((err) => {
          console.error('Failed to load donations:', err);
          return { donatedItems: [] };
        }),
        concernsAPI.getAll().catch((err) => {
          console.error('Failed to load concerns:', err);
          return { concerns: [] };
        }),
        messagesAPI.getConversations().catch((err) => {
          console.error('Failed to load messages:', err);
          return { conversations: [] };
        }),
        itemsAPI.getAll().catch((err) => {
          console.error('Failed to load items:', err);
          return { items: [] };
        })
      ]);
      
      console.log('Loaded data:', { usersData, donationsData, concernsData, messagesData, itemsData });
      
      setUsers(usersData.users || []);
      setDonations(donationsData.donatedItems || []);
      setConcerns(concernsData.concerns || []);
      setMessages(messagesData.conversations || []);
      setLostFoundItems(itemsData.items || []);
      
      // Load admin profile
      await loadAdminProfile();
    } catch (error: any) {
      console.error('Failed to load admin data:', error);
      toast({
        title: "Failed to load admin data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAdminProfile = async () => {
    try {
      const data = await authAPI.getProfile();
      setAdminProfile(data.user);
      setProfileForm({
        username: data.user.username || '',
        phone: data.user.phone || '',
        address: data.user.address || '',
        bio: data.user.bio || '',
        roll_number: data.user.roll_number || ''
      });
    } catch (error: any) {
      console.error('Failed to load admin profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await authAPI.updateProfile(profileForm);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
      setIsEditingProfile(false);
      await loadAdminProfile();
    } catch (error: any) {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    try {
      await authAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully"
      });
      setShowPasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        title: "Failed to change password",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleViewUser = async (userId: number) => {
    // Load full conversation with this user
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/messages/conversation/${userId}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load conversation');
      
      const data = await response.json();
      const user = users.find(u => u.id === userId) || messages.find(m => m.other_user_id === userId);
      
      setCurrentConversation(data.messages || []);
      setConversationUser({ id: userId, username: user?.username || 'User' });
      setShowConversationDialog(true);
    } catch (error: any) {
      toast({
        title: "Failed to load conversation",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSuspendUser = async (userId: number) => {
    try {
      await adminAPI.updateUser(userId, { status: 'suspended' });
      toast({ title: "User suspended successfully" });
      loadAdminData();
    } catch (error: any) {
      toast({
        title: "Failed to suspend user",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleMakeAdmin = async (userId: number) => {
    try {
      await adminAPI.updateUser(userId, { role: 'admin' });
      toast({ title: "User promoted to admin successfully" });
      loadAdminData();
    } catch (error: any) {
      toast({
        title: "Failed to promote user",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = (itemId: number, itemType: string) => {
    setDeleteTarget({ id: itemId, type: itemType });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      switch (deleteTarget.type) {
        case 'user':
          await adminAPI.deleteUser(deleteTarget.id);
          toast({ title: "User deleted successfully" });
          break;
        case 'donation':
          await donatedItemsAPI.delete(deleteTarget.id);
          toast({ title: "Donation deleted successfully" });
          break;
        case 'concern':
          await concernsAPI.delete(deleteTarget.id);
          toast({ title: "Concern deleted successfully" });
          break;
        case 'lost & found item':
          await itemsAPI.delete(deleteTarget.id);
          toast({ title: "Item deleted successfully" });
          break;
      }
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      loadAdminData();
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleContactUser = (userId: number, username: string) => {
    setMessageTarget({ userId, username });
    setShowMessageDialog(true);
  };

  const handleSendMessage = async () => {
    if (!messageTarget || !messageContent.trim()) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recipientId: messageTarget.userId,
          content: messageContent
        })
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      toast({
        title: "Message sent",
        description: `Your message has been sent to ${messageTarget.username}`
      });
      
      setShowMessageDialog(false);
      setMessageContent("");
      setMessageTarget(null);
      loadAdminData(); // Reload to update messages
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSendInConversation = async () => {
    if (!conversationUser || !messageContent.trim()) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recipientId: conversationUser.id,
          content: messageContent
        })
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      
      // Add the new message to current conversation
      setCurrentConversation([...currentConversation, data.messageData]);
      setMessageContent("");
      
      toast({
        title: "Message sent",
        description: `Your message has been sent to ${conversationUser.username}`
      });
      
      loadAdminData(); // Reload to update messages list
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleActivateUser = async (userId: number) => {
    try {
      await adminAPI.updateUser(userId, { status: 'active' });
      toast({ title: "User activated successfully" });
      loadAdminData();
    } catch (error: any) {
      toast({
        title: "Failed to activate user",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleMarkDonationClaimed = async (itemId: number) => {
    try {
      await donatedItemsAPI.updateStatus(itemId, { status: 'claimed' });
      toast({ title: "Donation marked as claimed" });
      loadAdminData();
    } catch (error: any) {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleMarkDonationAvailable = async (itemId: number) => {
    try {
      await donatedItemsAPI.updateStatus(itemId, { status: 'available' });
      toast({ title: "Donation marked as available" });
      loadAdminData();
    } catch (error: any) {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateConcernStatus = async (concernId: number, status: string) => {
    try {
      await concernsAPI.updateStatus(concernId, { status });
      toast({ title: `Concern marked as ${status}` });
      loadAdminData();
    } catch (error: any) {
      toast({
        title: "Failed to update concern status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateItemStatus = async (itemId: number, status: string) => {
    try {
      await itemsAPI.updateStatus(itemId, { status });
      toast({ title: `Item marked as ${status}` });
      loadAdminData();
    } catch (error: any) {
      toast({
        title: "Failed to update item status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-secondary/10 text-secondary";
      case "Suspended":
      case "Banned":
        return "bg-destructive/10 text-destructive";
      case "Pending":
        return "bg-yellow-500/10 text-yellow-600";
      case "In Progress":
        return "bg-primary/10 text-primary";
      case "Resolved":
        return "bg-secondary/10 text-secondary";
      case "Flagged":
        return "bg-destructive/10 text-destructive";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-muted text-muted-foreground";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-600";
      case "High":
        return "bg-orange-500/10 text-orange-600";
      case "Critical":
        return "bg-destructive/10 text-destructive";
      default:
        return "";
    }
  };

  const sidebarItems = [
    { id: "overview", icon: LayoutDashboard, label: "Dashboard" },
    { id: "users", icon: Users, label: "Users" },
    { id: "donations", icon: Package, label: "Donations" },
    { id: "lostfound", icon: Search, label: "Lost & Found" },
    { id: "concerns", icon: Flag, label: "Concerns" },
    { id: "messages", icon: MessageCircle, label: "Messages" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const stats = [
    { label: "Total Users", value: users.length.toString(), icon: Users, change: "+12%", color: "bg-primary" },
    { label: "Total Donations", value: donations.length.toString(), icon: Package, change: "+8%", color: "bg-secondary" },
    { label: "Lost & Found", value: lostFoundItems.length.toString(), icon: Search, change: "+5%", color: "bg-yellow-500" },
    { label: "Active Concerns", value: concerns.filter(c => c.status === 'pending' || c.status === 'in_progress').length.toString(), icon: Flag, change: "-3%", color: "bg-destructive" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border min-h-screen fixed left-0 top-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Recycle className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold">RecyConnect</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Dashboard Tab */}
        {activeSection === "overview" && (
          <div className="animate-fade-in">
            <h1 className="font-display text-3xl font-bold text-foreground mb-8">
              Dashboard Overview
            </h1>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-card rounded-xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-secondary' : 'text-destructive'}`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {[
                    { action: "New user registered", user: "john_doe", time: "2 min ago" },
                    { action: "Item donated", user: "sarah_smith", time: "15 min ago" },
                    { action: "Concern raised", user: "mike_j", time: "1 hour ago" },
                    { action: "Item marked as claimed", user: "anonymous", time: "2 hours ago" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">by {activity.user}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setActiveSection("users")}
                  >
                    <Users className="w-6 h-6" />
                    <span>Manage Users</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setActiveSection("donations")}
                  >
                    <Package className="w-6 h-6" />
                    <span>Review Items</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setActiveSection("concerns")}
                  >
                    <Flag className="w-6 h-6" />
                    <span>View Concerns</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setActiveSection("settings")}
                  >
                    <Settings className="w-6 h-6" />
                    <span>Settings</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeSection === "users" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display text-3xl font-bold text-foreground">Users</h1>
              <div className="flex gap-4">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>College Code</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.college_code || 'N/A'}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleViewUser(user.id)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleContactUser(user.id, user.username)}>
                                  <MessageCircle className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Contact User</TooltipContent>
                            </Tooltip>
                            {user.status === 'suspended' ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleActivateUser(user.id)}>
                                    <Shield className="w-4 h-4 text-green-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Activate User</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleSuspendUser(user.id)}>
                                    <Ban className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Suspend User</TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleMakeAdmin(user.id)}>
                                  <Shield className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Make Admin</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteItem(user.id, 'user')}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete User</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeSection === "donations" && (
          <div className="animate-fade-in">
            <h1 className="font-display text-3xl font-bold text-foreground mb-6">Donations</h1>
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Posted By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : donations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No donations found
                      </TableCell>
                    </TableRow>
                  ) : donations.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.username || 'Anonymous'}</TableCell>
                      <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleViewUser(item.id)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleContactUser(item.user_id, item.username)}>
                                  <MessageCircle className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Contact Donor</TooltipContent>
                            </Tooltip>
                            {item.status === 'claimed' ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleMarkDonationAvailable(item.id)}>
                                    <Package className="w-4 h-4 text-green-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Mark Available</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleMarkDonationClaimed(item.id)}>
                                    <Package className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Mark as Claimed</TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteItem(item.id, 'donation')}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Donation</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Concerns Tab */}
        {activeSection === "concerns" && (
          <div className="animate-fade-in">
            <h1 className="font-display text-3xl font-bold text-foreground mb-6">Concerns</h1>
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : concerns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No concerns found
                      </TableCell>
                    </TableRow>
                  ) : concerns.map((concern) => (
                    <TableRow key={concern.id}>
                      <TableCell className="font-medium">{concern.id}</TableCell>
                      <TableCell>{concern.title}</TableCell>
                      <TableCell>{concern.username || 'Anonymous'}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(concern.priority)}>{concern.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(concern.status)}>{concern.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(concern.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleViewUser(concern.id)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleContactUser(concern.user_id, concern.username)}>
                                  <MessageCircle className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Contact Reporter</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleUpdateConcernStatus(concern.id, 'in_progress')}>
                                  <Clock className="w-4 h-4 text-yellow-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Mark In Progress</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleUpdateConcernStatus(concern.id, 'resolved')}>
                                  <Shield className="w-4 h-4 text-green-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Mark Resolved</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteItem(concern.id, 'concern')}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Concern</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Lost & Found Tab */}
        {activeSection === "lostfound" && (
          <div className="animate-fade-in">
            <h1 className="font-display text-3xl font-bold text-foreground mb-6">Lost & Found Items</h1>
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Posted By</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : lostFoundItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No lost & found items
                      </TableCell>
                    </TableRow>
                  ) : lostFoundItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.username || 'Anonymous'}</TableCell>
                      <TableCell>{item.location || 'N/A'}</TableCell>
                      <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleViewUser(item.id)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleContactUser(item.user_id, item.username)}>
                                  <MessageCircle className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Contact Reporter</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleUpdateItemStatus(item.id, 'found')}>
                                  <Search className="w-4 h-4 text-green-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Mark as Found</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleUpdateItemStatus(item.id, 'claimed')}>
                                  <Package className="w-4 h-4 text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Mark as Claimed</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteItem(item.id, 'lost & found item')}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Item</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeSection === "messages" && (
          <div className="animate-fade-in">
            <h1 className="font-display text-3xl font-bold text-foreground mb-6">Messages</h1>
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Last Message</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Unread</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : messages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No messages found
                      </TableCell>
                    </TableRow>
                  ) : messages.map((conversation) => (
                    <TableRow key={conversation.other_user_id}>
                      <TableCell className="font-medium">{conversation.username}</TableCell>
                      <TableCell className="max-w-xs truncate">{conversation.last_message}</TableCell>
                      <TableCell>{new Date(conversation.last_message_time).toLocaleString()}</TableCell>
                      <TableCell>
                        {conversation.unread_count > 0 && (
                          <Badge className="bg-destructive/10 text-destructive">{conversation.unread_count}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleViewUser(conversation.other_user_id)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Conversation</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Settings Section */}
        {activeSection === "settings" && (
          <div className="animate-fade-in">
            <h1 className="font-display text-3xl font-bold text-foreground mb-6">Settings</h1>
            
            {/* Admin Profile Card */}
            <div className="bg-card rounded-xl shadow-card p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Admin Profile
                </h2>
                {!isEditingProfile && (
                  <Button onClick={() => setIsEditingProfile(true)} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

              {loading || !adminProfile ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : isEditingProfile ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="roll_number">Roll Number</Label>
                      <Input
                        id="roll_number"
                        value={profileForm.roll_number}
                        onChange={(e) => setProfileForm({ ...profileForm, roll_number: e.target.value })}
                        placeholder="Enter roll number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        placeholder="Enter address"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Enter bio"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleUpdateProfile}>
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileForm({
                          username: adminProfile.username || '',
                          phone: adminProfile.phone || '',
                          address: adminProfile.address || '',
                          bio: adminProfile.bio || '',
                          roll_number: adminProfile.roll_number || ''
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Username</p>
                      <p className="font-medium text-foreground">{adminProfile.username || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <p className="font-medium text-foreground">{adminProfile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Phone</p>
                      <p className="font-medium text-foreground">{adminProfile.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Roll Number</p>
                      <p className="font-medium text-foreground">{adminProfile.roll_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Address</p>
                      <p className="font-medium text-foreground">{adminProfile.address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Role</p>
                      <Badge className="bg-primary/10 text-primary">{adminProfile.role}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bio</p>
                    <p className="font-medium text-foreground">{adminProfile.bio || 'No bio added yet'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                    <p className="font-medium text-foreground">{new Date(adminProfile.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Account Settings */}
            <div className="bg-card rounded-xl shadow-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Account Security
              </h2>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </div>

            {/* Change Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new password.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setShowPasswordDialog(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleChangePassword}>
                    Change Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteDialog(false);
              setDeleteTarget(null);
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {messageTarget?.username}</DialogTitle>
            <DialogDescription>
              Send a message to this user from the admin panel.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              className="w-full min-h-[120px] p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary mt-2"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message here..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowMessageDialog(false);
              setMessageContent("");
              setMessageTarget(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!messageContent.trim()}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conversation View Dialog */}
      <Dialog open={showConversationDialog} onOpenChange={setShowConversationDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Conversation with {conversationUser?.username}</DialogTitle>
            <DialogDescription>
              View and send messages in this conversation
            </DialogDescription>
          </DialogHeader>
          
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto space-y-3 py-4 min-h-[300px] max-h-[400px]">
            {currentConversation.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No messages yet</p>
            ) : (
              currentConversation.map((msg, index) => {
                const isAdmin = msg.sender_id === adminProfile?.id;
                return (
                  <div
                    key={index}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isAdmin
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Send Message Input */}
          <div className="border-t pt-4">
            <Label htmlFor="conversationMessage">Send a message</Label>
            <div className="flex gap-2 mt-2">
              <textarea
                id="conversationMessage"
                className="flex-1 min-h-[80px] p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message here..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendInConversation();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="outline" onClick={() => {
                setShowConversationDialog(false);
                setMessageContent("");
                setCurrentConversation([]);
                setConversationUser(null);
              }}>
                Close
              </Button>
              <Button onClick={handleSendInConversation} disabled={!messageContent.trim()}>
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
