import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Heart,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  Plus,
  Edit,
  Trash2,
  Download,
  AlertTriangle,
  UserCheck,
  UserX,
  CalendarX,
  Star,
  TrendingUp,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Activity,
  Clock,
  Database,
  LogOut,
  Settings,
  FileText,
  Mail,
  Send,
  Save,
  RefreshCw,
  Shield,
  MapPin,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import apiService, {
  User,
  Category,
  Setting,
  Contact,
  Page,
  Event,
} from "@/services/api";
import { toast } from "sonner";
import Swal from "sweetalert2";

// API Configuration
const STORAGE_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") ||
  "http://localhost:8000";

interface DashboardStats {
  total_users: number;
  pending_users: number;
  active_events: number;
  total_contacts: number;
  recent_users: User[];
  recent_contacts: Contact[];
}

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(false);

  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );

  // State for users management
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [createAdminDialogOpen, setCreateAdminDialogOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
  });
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // active/inactive/all
  const [approvalFilter, setApprovalFilter] = useState(""); //
  const rowsPerPage = 10;

  // Search handler
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();

    // Search by text fields
    const matchesSearch =
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.mobile?.toString().includes(search) ||
      user.location?.toLowerCase().includes(search);

    // Filter by registration date (if set)
    const matchesDate = selectedDate
      ? new Date(user.created_at).toISOString().slice(0, 10) === selectedDate
      : true;

    // Filter by user status (if set)
    const matchesStatus = statusFilter ? user.status === statusFilter : true;

    // Filter by approval status (if set)
    const matchesApproval = approvalFilter
      ? user.approval_status === approvalFilter
      : true;

    return matchesSearch && matchesDate && matchesStatus && matchesApproval;
  });

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // State for document viewing
  const [documentViewOpen, setDocumentViewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{
    url: string;
    name: string;
  } | null>(null);

  // State for categories management
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    status: "active",
    max_guests: 4,
  });

  // State for settings management
  const [settings, setSettings] = useState<Setting[]>([]);
  const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null);
  const [settingDialogOpen, setSettingDialogOpen] = useState(false);
  const [settingForm, setSettingForm] = useState({
    key: "",
    value: "",
    type: "string",
  });

  // State for pages management (Terms & Conditions)
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [pageForm, setPageForm] = useState({
    title: "",
    content: "",
    status: "active",
  });

  // State for contacts management
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [replyForm, setReplyForm] = useState({
    subject: "",
    message: "",
  });

  // State for messaging
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [massMessageForm, setMassMessageForm] = useState({
    type: "notification",
    title: "",
    subject: "",
    message: "",
  });

  // State for events management
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    category_id: 0,
    location: "",
    event_date: "",
    start_time: "",
    end_time: "",
    max_participants: 50,
    organizer_id: 0,
    status: "active",
    image_url: "",
    requirements: [] as string[],
    contact_info: "",
    is_featured: false,
    registration_deadline: "",
    event_type: "charity",
    tags: [] as string[],
  });

  const [searchTermEvent, setSearchTermEvent] = useState("");
  const [selectedDateEvent, setSelectedDateEvent] = useState("");
  const [statusFilterEvent, setStatusFilterEvent] = useState("");
  const [featuredFilterEvent, setFeaturedFilterEvent] = useState("");
  const [currentPageEvent, setCurrentPageEvent] = useState(1);
  const rowsPerPageEvent = 10;

  const filteredEvents = events.filter((event) => {
    const search = searchTermEvent.toLowerCase();

    // Search by multiple fields
    const matchesSearch =
      event.title.toLowerCase().includes(search) ||
      event.location.toLowerCase().includes(search) ||
      event.contact_info.toLowerCase().includes(search) || // for mobile/contact
      event.category_id.toString().includes(search) ||
      event.event_type.toLowerCase().includes(search);

    // Filter by event date
    const matchesDate = selectedDateEvent
      ? new Date(event.event_date).toISOString().slice(0, 10) ===
        selectedDateEvent
      : true;

    // Filter by status (e.g., active/cancelled)
    const matchesStatus = statusFilterEvent
      ? event.status === statusFilterEvent
      : true;

    // Filter by featured status
    const matchesFeatured = featuredFilterEvent
      ? featuredFilterEvent === "featured"
        ? event.is_featured
        : !event.is_featured
      : true;

    return matchesSearch && matchesDate && matchesStatus && matchesFeatured;
  });

  const totalPagesEvent = Math.ceil(filteredEvents.length / rowsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPageEvent - 1) * rowsPerPageEvent,
    currentPageEvent * rowsPerPageEvent,
  );

  // State for reviews management
  const [reviews, setReviews] = useState<
    Array<{
      id: number;
      event_id: number;
      event_title: string;
      event_date: string;
      user_id: number;
      reviewer_name: string;
      rating: number;
      review: string;
      created_at: string;
      formatted_date: string;
    }>
  >([]);
  const [reviewsStats, setReviewsStats] = useState<{
    total_reviews: number;
    average_rating: number;
    rating_distribution: {
      "1": number;
      "2": number;
      "3": number;
      "4": number;
      "5": number;
    };
  } | null>(null);
  const [reviewsPagination, setReviewsPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
    has_more: false,
  });
  const [reviewsFilters, setReviewsFilters] = useState({
    search: "",
    event_id: "",
    rating: "all",
  });

  // State for form options management
  const [formOptions, setFormOptions] = useState<{
    education?: Array<any>;
    skills?: Array<any>;
    diseases?: Array<any>;
    documents?: Array<any>;
  }>({});
  const [selectedFormOption, setSelectedFormOption] = useState<any>(null);
  const [formOptionDialogOpen, setFormOptionDialogOpen] = useState(false);
  const [formOptionForm, setFormOptionForm] = useState({
    type: "education",
    name: "",
    value: "",
    description: "",
    is_active: true,
    sort_order: 0,
  });
  const [selectedFormOptionType, setSelectedFormOptionType] =
    useState("education");
  const [eventEditTimeLimit, setEventEditTimeLimit] = useState("24");
  const [isSavingTimeLimit, setIsSavingTimeLimit] = useState(false);

  // State for OTP method toggle
  const [otpMethod, setOtpMethod] = useState("email"); // "email" or "mobile"
  const [originalOtpMethod, setOriginalOtpMethod] = useState("email"); // Track original value
  const [isSavingOtpMethod, setIsSavingOtpMethod] = useState(false);

  // State for reports management
  const [reportsData, setReportsData] = useState<{
    overview: {
      total_users: number;
      active_users: number;
      pending_users: number;
      total_events: number;
      active_events: number;
      completed_events: number;
      total_reviews: number;
      average_rating: number;
      total_contacts: number;
    };
    userStats: {
      monthly_registrations: Array<{ month: string; count: number }>;
      user_status_distribution: Array<{
        status: string;
        count: number;
        percentage: number;
      }>;
      top_locations: Array<{ location: string; count: number }>;
    };
    eventStats: {
      monthly_events: Array<{ month: string; count: number }>;
      events_by_category: Array<{
        category: string;
        count: number;
        percentage: number;
      }>;
      participation_stats: Array<{
        month: string;
        total_participants: number;
        avg_per_event: number;
      }>;
    };
    reviewStats: {
      monthly_reviews: Array<{
        month: string;
        count: number;
        avg_rating: number;
      }>;
      rating_distribution: Array<{
        rating: number;
        count: number;
        percentage: number;
      }>;
      top_rated_events: Array<{
        event_title: string;
        avg_rating: number;
        review_count: number;
      }>;
    };
  } | null>(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedReportPeriod, setSelectedReportPeriod] =
    useState("last_6_months");
  const [selectedReportType, setSelectedReportType] = useState("overview");

  // Check admin authentication
  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isAdminLoggedIn) {
      navigate("/admin-login");
    }
  }, [navigate]);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAdminDashboard();
      setDashboardStats(data);
    } catch (error: any) {
      toast.error("Failed to load dashboard data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load users data
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAllUsers();
      console.log("API Response:", response);

      // Handle the response structure - users are in response.data
      const usersData = response.data || response;

      // Transform the user data to match our expected format
      const transformedUsers = usersData.map((user: any) => {
        let others = {};
        try {
          others = JSON.parse(user.others || "{}");
        } catch (e) {
          others = {};
        }

        // Extract documents from the others JSON structure
        const documents = [];
        if (others.doc1File) {
          documents.push({
            type: others.doc1Type || "Document 1",
            number: others.doc1Number || "",
            file: others.doc1File,
          });
        }
        if (others.doc2File) {
          documents.push({
            type: others.doc2Type || "Document 2",
            number: others.doc2Number || "",
            file: others.doc2File,
          });
        }

        return {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          mobile: user.mobile,
          age: others.age || null,
          location: others.location || null,
          status:
            user.status === 1
              ? "active"
              : user.status === 2
                ? "rejected"
                : "inactive",
          created_at: user.created_at,
          documents: documents,
          skills: others.selectedSkills || others.skills || [],
          approval_status:
            user.approval_status ||
            (user.status === 1
              ? "approved"
              : user.status === 2
                ? "rejected"
                : "pending"),
          admin_comments: user.admin_comments,
          approval_date: user.approval_date,
          // Add additional user details from others
          others: others,
        };
      });

      console.log("Transformed Users:", transformedUsers);
      console.log(
        "Pending users count:",
        transformedUsers.filter(
          (user) => !user.approval_status || user.approval_status === "pending",
        ).length,
      );
      setUsers(transformedUsers);
    } catch (error: any) {
      console.error("Load users error:", error);
      toast.error("Failed to load users: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load admins data
  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAdmins();
      setAdmins(data);
    } catch (error: any) {
      toast.error("Failed to load admins: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load detailed user information
  const loadUserDetails = async (userId: number) => {
    try {
      console.log("Loading user details for:", userId);
      console.log("Available users:", users);
      setUserDetailsLoading(true);
      // Find the user from the existing users array
      const user = users.find((u) => u.id === userId);
      console.log("Found user:", user);
      if (user) {
        setSelectedUser(user);
      } else {
        console.log("User not found in array, calling API");
        // Fallback to API call if user not found in array
        const data = await apiService.getUserInfo(userId);
        console.log("API response:", data);
        setSelectedUser(data);
      }
    } catch (error: any) {
      console.error("Load user details error:", error);
      toast.error("Failed to load user details: " + error.message);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  // Handle user status change (approve/deactivate)
  const handleUserStatusChange = async (userId: number, newStatus: string) => {
    try {
      console.log("Changing user status:", { userId, newStatus });
      setIsLoading(true);
      await apiService.updateUserStatus(userId, newStatus);
      toast.success(
        `User ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      );
      // Reload users to reflect changes
      loadUsers();
    } catch (error: any) {
      console.error("Status change error:", error);
      toast.error("Failed to update user status: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document viewing
  const handleDocumentView = (documentPath: string, documentName: string) => {
    // Check if the document URL is a full URL or just a path
    let fullUrl = documentPath;
    if (!documentPath.startsWith("http")) {
      // Documents are stored in storage folder with the path from database
      fullUrl = `${STORAGE_BASE_URL}/storage/${documentPath}`;
    }

    setSelectedDocument({
      url: fullUrl,
      name: documentName,
    });
    setDocumentViewOpen(true);
  };

  // Handle user approval/rejection with email and notification
  const handleUserApproval = async (
    userId: number,
    approvalStatus: string,
    adminComments?: string,
  ) => {
    try {
      console.log("Changing user approval status:", {
        userId,
        approvalStatus,
        adminComments,
      });
      setIsLoading(true);

      // Find the user to get their details
      const user = users.find((u) => u.id === userId);
      if (!user) {
        toast.error("User not found");
        return;
      }

      // Update approval status in database
      console.log("Calling approveUserProfile with:", {
        userId,
        approvalStatus,
        adminComments,
      });
      await apiService.approveUserProfile(
        userId,
        approvalStatus,
        adminComments,
      );
      console.log("User approval API call completed successfully");

      // Prepare email and notification content based on approval status
      let emailSubject, emailMessage, notificationTitle, notificationMessage;

      if (approvalStatus === "approved") {
        emailSubject = "🎉 Your Share2Care Profile Has Been Approved!";
        emailMessage = `
Dear ${user.name},

Congratulations! Your profile on Share2Care has been successfully approved by our admin team.

You can now:
✅ Create and host events
✅ Join community events
✅ Connect with other members
✅ Share your skills and time

${adminComments ? `Admin Comments: ${adminComments}` : ""}

Welcome to the Share2Care community! We're excited to have you on board.

Best regards,
The Share2Care Team

---
This is an automated message. Please do not reply to this email.
        `;

        notificationTitle = "Profile Approved! 🎉";
        notificationMessage = `Your profile has been approved! You can now create and join events. ${adminComments ? `Admin note: ${adminComments}` : ""}`;
      } else if (approvalStatus === "rejected") {
        emailSubject = "Share2Care Profile Review Update";
        emailMessage = `
Dear ${user.name},

Thank you for your interest in joining Share2Care. After reviewing your profile, we need you to make some updates before we can approve your account.

${adminComments ? `Reason for review: ${adminComments}` : "Please ensure all required information is complete and accurate."}

What you can do:
📝 Update your profile information
📋 Complete any missing required fields
📄 Upload any required documents
🔄 Resubmit for review

Please log in to your account and update your profile, then contact our support team for re-review.

If you have any questions, please don't hesitate to reach out to our support team.

Best regards,
The Share2Care Team

---
This is an automated message. Please do not reply to this email.
        `;

        notificationTitle = "Profile Needs Review";
        notificationMessage = `Your profile requires some updates before approval. ${adminComments ? `Admin feedback: ${adminComments}` : "Please check your profile and make necessary updates."}`;
      }

      // Send email notification
      try {
        await apiService.sendEmailToUser(userId, {
          subject: emailSubject,
          message: emailMessage,
          template: "user_approval",
        });
        console.log("Approval email sent successfully");
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
        // Don't fail the whole process if email fails
      }

      // Send in-app notification
      try {
        await apiService.sendNotificationToUser(userId, {
          title: notificationTitle,
          message: notificationMessage,
          type:
            approvalStatus === "approved"
              ? "approval_success"
              : "approval_review",
        });
        console.log("Approval notification sent successfully");
      } catch (notificationError) {
        console.error(
          "Failed to send approval notification:",
          notificationError,
        );
        // Don't fail the whole process if notification fails
      }

      toast.success(
        `User ${approvalStatus} successfully! Email and notification sent.`,
      );

      // Reload users and dashboard data to reflect changes
      await Promise.all([loadUsers(), loadDashboardData()]);
    } catch (error: any) {
      console.error("Approval status change error:", error);
      toast.error("Failed to update user approval status: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load categories data
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAllCategories();
      setCategories(data);
    } catch (error: any) {
      toast.error("Failed to load categories: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load settings data
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAllSettings();
      setSettings(data);

      // Set the current event edit time limit value
      const eventEditTimeLimitSetting = data.find(
        (setting) => setting.key === "event_edit_time_limit",
      );
      if (eventEditTimeLimitSetting) {
        setEventEditTimeLimit(eventEditTimeLimitSetting.value);
      } else {
        // If setting doesn't exist, create it
        await initializeEventEditTimeLimitSetting();
      }

      // Load the current OTP method from the dedicated API
      try {
        const currentOtpMethod = await apiService.getOtpMethod();
        setOtpMethod(currentOtpMethod);
        setOriginalOtpMethod(currentOtpMethod);
      } catch (error) {
        console.error("Failed to load OTP method:", error);
        setOtpMethod("email"); // Default to email
        setOriginalOtpMethod("email");
      }
    } catch (error: any) {
      toast.error("Failed to load settings: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize event edit time limit setting if it doesn't exist
  const initializeEventEditTimeLimitSetting = async () => {
    try {
      const newSetting = {
        key: "event_edit_time_limit",
        value: "24",
        type: "number",
        description:
          "Hours before event start when editing/managing is disabled",
      };

      await apiService.createSetting(newSetting);
      console.log("Event edit time limit setting initialized");

      // Set the default value in state
      setEventEditTimeLimit("24");

      // Reload settings to include the new one
      const updatedData = await apiService.getAllSettings();
      setSettings(updatedData);
    } catch (error) {
      console.error("Error initializing event edit time limit setting:", error);
    }
  };

  // Initialize OTP method setting if it doesn't exist
  const initializeOtpMethodSetting = async () => {
    try {
      const newSetting = {
        key: "otp_method",
        value: "email",
        type: "string",
        description:
          "OTP delivery method for user authentication (email or mobile)",
      };

      await apiService.createSetting(newSetting);
      console.log("OTP method setting initialized");

      // Set the default value in state
      setOtpMethod("email");

      // Reload settings to include the new one
      const updatedData = await apiService.getAllSettings();
      setSettings(updatedData);
    } catch (error) {
      console.error("Error initializing OTP method setting:", error);
    }
  };

  // Save event edit time limit setting - direct save like existing settings
  const saveEventEditTimeLimit = async () => {
    try {
      if (!eventEditTimeLimit.trim()) {
        toast.error("Time limit value is required");
        return;
      }

      setIsSavingTimeLimit(true);
      const setting = settings.find((s) => s.key === "event_edit_time_limit");

      if (setting) {
        // Update existing setting using exact same pattern as handleUpdateSetting
        await apiService.updateSetting({
          id: setting.id,
          key: "event_edit_time_limit",
          value: eventEditTimeLimit,
          type: "number",
        });
        toast.success("Event edit time limit updated successfully");
      } else {
        // Create new setting using exact same pattern as handleCreateSetting
        await apiService.createSetting({
          key: "event_edit_time_limit",
          value: eventEditTimeLimit,
          type: "number",
        });
        toast.success("Event edit time limit created successfully");
      }

      loadSettings(); // Refresh settings
    } catch (error: any) {
      toast.error("Failed to save setting: " + error.message);
    } finally {
      setIsSavingTimeLimit(false);
    }
  };

  // Save OTP method setting
  const saveOtpMethod = async () => {
    try {
      setIsSavingOtpMethod(true);

      // Use the new dedicated OTP method API
      await apiService.updateOtpMethod(otpMethod as "email" | "mobile");
      toast.success("OTP method updated successfully");

      // Update the original value to reflect the saved state
      setOriginalOtpMethod(otpMethod);
    } catch (error: any) {
      toast.error("Failed to save OTP method: " + error.message);
    } finally {
      setIsSavingOtpMethod(false);
    }
  };

  // Load pages data
  const loadPages = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAllPages();
      setPages(data);
    } catch (error: any) {
      toast.error("Failed to load pages: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load contacts data
  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAllContacts();
      setContacts(data);
    } catch (error: any) {
      toast.error("Failed to load contacts: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load events data
  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAllEvents();
      console.log("Events API Response:", response);

      // Handle the response structure - events might be in response.data
      const eventsData = Array.isArray(response)
        ? response
        : response.data || [];
      console.log("Processed Events Data:", eventsData);

      setEvents(eventsData);
    } catch (error: any) {
      console.error("Load events error:", error);
      toast.error("Failed to load events: " + error.message);
      // Set empty array on error to prevent UI issues
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load form options data
  const loadFormOptions = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAllFormOptionsForAdmin();
      console.log("Form Options API Response:", response);

      if (response.success) {
        setFormOptions(response.data);
      }
    } catch (error: any) {
      console.error("Load form options error:", error);
      toast.error("Failed to load form options: " + error.message);
      setFormOptions({});
    } finally {
      setIsLoading(false);
    }
  };

  // Load reviews data
  const loadReviews = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await apiService.getAllReviews({
        page,
        limit: reviewsPagination.per_page,
        search: reviewsFilters.search,
        event_id: reviewsFilters.event_id
          ? parseInt(reviewsFilters.event_id)
          : undefined,
        rating:
          reviewsFilters.rating && reviewsFilters.rating !== "all"
            ? parseInt(reviewsFilters.rating)
            : undefined,
      });

      setReviews(response.reviews);
      setReviewsPagination(response.pagination);
      setReviewsStats(response.stats);
    } catch (error: any) {
      console.error("Load reviews error:", error);
      toast.error("Failed to load reviews: " + error.message);
      setReviews([]);
      setReviewsStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load reports data
  const loadReportsData = async () => {
    try {
      setReportsLoading(true);
      const response = await apiService.getReportsData(selectedReportPeriod);

      console.log("Reports API Response:", response);

      // Handle the response structure properly
      if (response.success && response.data) {
        setReportsData(response.data);
        toast.success("Reports data loaded successfully");
      } else if (response.data) {
        setReportsData(response.data);
        toast.success("Reports data loaded successfully");
      } else {
        setReportsData(response);
        toast.success("Reports data loaded successfully");
      }
    } catch (error: any) {
      console.error("Load reports error:", error);
      toast.error(
        "Failed to load reports data. Please check your connection and try again.",
      );
      setReportsData(null);
    } finally {
      setReportsLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case "dashboard":
        loadDashboardData();
        break;
      case "users":
        loadUsers();
        loadAdmins();
        break;
      case "database":
        loadCategories();
        break;
      case "settings":
        loadSettings();
        break;
      case "terms":
        loadPages();
        break;
      case "contacts":
        loadContacts();
        break;
      case "events":
        loadEvents();
        loadAdmins(); // Load admins for organizer dropdown
        loadCategories(); // Load categories for category dropdown
        break;
      case "form-options":
        loadFormOptions();
        break;
      case "reviews":
        loadReviews();
        break;
      case "reports":
        loadReportsData();
        break;
    }
  }, [activeTab]);

  // Reload reviews when filters change (with debounce for search)
  useEffect(() => {
    if (activeTab === "reviews") {
      const timeoutId = setTimeout(() => {
        loadReviews(1);
      }, 500); // 500ms debounce for search

      return () => clearTimeout(timeoutId);
    }
  }, [reviewsFilters.search, reviewsFilters.rating, reviewsFilters.event_id]);

  // Reload reports when period changes
  useEffect(() => {
    if (activeTab === "reports") {
      loadReportsData();
    }
  }, [selectedReportPeriod]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await apiService.adminLogout();
      navigate("/admin-login");
    } catch (error) {
      // Even if API call fails, still logout locally
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      navigate("/admin-login");
    }
  };

  // Category management functions
  const handleCreateCategory = async () => {
    try {
      if (!categoryForm.name.trim()) {
        toast.error("Category name is required");
        return;
      }

      setIsLoading(true);
      await apiService.createCategory(categoryForm);
      toast.success("Category created successfully");
      setCategoryDialogOpen(false);
      setCategoryForm({ name: "", status: "active", max_guests: 4 });
      loadCategories();
    } catch (error: any) {
      toast.error("Failed to create category: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    try {
      if (!selectedCategory || !categoryForm.name.trim()) {
        toast.error("Category name is required");
        return;
      }

      setIsLoading(true);
      await apiService.updateCategory({
        id: selectedCategory.id,
        ...categoryForm,
      });
      toast.success("Category updated successfully");
      setCategoryDialogOpen(false);
      setSelectedCategory(null);
      setCategoryForm({ name: "", status: "active", max_guests: 4 });
      loadCategories();
    } catch (error: any) {
      toast.error("Failed to update category: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      setIsLoading(true);
      await apiService.deleteCategory(categoryId);
      toast.success("Category deleted successfully");
      loadCategories();
    } catch (error: any) {
      toast.error("Failed to delete category: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Setting management functions
  const handleCreateSetting = async () => {
    try {
      if (!settingForm.key.trim() || !settingForm.value.trim()) {
        toast.error("Key and value are required");
        return;
      }

      setIsLoading(true);
      await apiService.createSetting(settingForm);
      toast.success("Setting created successfully");
      setSettingDialogOpen(false);
      setSettingForm({ key: "", value: "", type: "string" });
      loadSettings();
    } catch (error: any) {
      toast.error("Failed to create setting: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSetting = async () => {
    try {
      if (
        !selectedSetting ||
        !settingForm.key.trim() ||
        !settingForm.value.trim()
      ) {
        toast.error("Key and value are required");
        return;
      }

      setIsLoading(true);
      await apiService.updateSetting({
        id: selectedSetting.id,
        ...settingForm,
      });
      toast.success("Setting updated successfully");
      setSettingDialogOpen(false);
      setSelectedSetting(null);
      setSettingForm({ key: "", value: "", type: "string" });
      loadSettings();
    } catch (error: any) {
      toast.error("Failed to update setting: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSetting = async (settingId: number) => {
    try {
      setIsLoading(true);
      await apiService.deleteSetting(settingId);
      toast.success("Setting deleted successfully");
      loadSettings();
    } catch (error: any) {
      toast.error("Failed to delete setting: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Page management functions
  const handleCreatePage = async () => {
    try {
      if (!pageForm.title.trim() || !pageForm.content.trim()) {
        toast.error("Title and content are required");
        return;
      }

      setIsLoading(true);
      await apiService.createPage({
        name: pageForm.title,
        content: pageForm.content,
        status: pageForm.status,
      });
      toast.success("Page created successfully");
      setPageDialogOpen(false);
      setSelectedPage(null);
      setPageForm({ title: "", content: "", status: "active" });
      loadPages();
    } catch (error: any) {
      toast.error("Failed to create page: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePage = async () => {
    try {
      if (!selectedPage || !pageForm.title.trim() || !pageForm.content.trim()) {
        toast.error("Title and content are required");
        return;
      }

      setIsLoading(true);
      await apiService.updatePage({
        id: selectedPage.id,
        title: pageForm.title,
        content: pageForm.content,
        status: pageForm.status,
      });
      toast.success("Page updated successfully");
      setPageDialogOpen(false);
      setSelectedPage(null);
      setPageForm({ title: "", content: "", status: "active" });
      loadPages();
    } catch (error: any) {
      toast.error("Failed to update page: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePage = async (pageId: number) => {
    try {
      setIsLoading(true);
      await apiService.deletePage(pageId);
      toast.success("Page deleted successfully");
      loadPages();
    } catch (error: any) {
      toast.error("Failed to delete page: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Contact management functions
  const handleReplyToContact = async () => {
    try {
      if (
        !selectedContact ||
        !replyForm.subject.trim() ||
        !replyForm.message.trim()
      ) {
        toast.error("Subject and message are required");
        return;
      }

      setIsLoading(true);
      await apiService.replyToContact({
        contact_id: selectedContact.id,
        subject: replyForm.subject,
        message: replyForm.message,
      });

      // Update contact status to replied
      await apiService.updateContact({
        id: selectedContact.id,
        status: "replied",
      });

      toast.success("Reply sent successfully");
      setContactDialogOpen(false);
      setSelectedContact(null);
      setReplyForm({ subject: "", message: "" });
      loadContacts();
    } catch (error: any) {
      toast.error("Failed to send reply: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin management functions
  const handleCreateAdmin = async () => {
    try {
      if (
        !adminForm.name.trim() ||
        !adminForm.email.trim() ||
        !adminForm.password.trim() ||
        !adminForm.mobile.trim()
      ) {
        toast.error("All fields are required");
        return;
      }

      setIsLoading(true);
      await apiService.createAdmin(adminForm);
      toast.success("Admin created successfully");
      setCreateAdminDialogOpen(false);
      setAdminForm({ name: "", email: "", password: "", mobile: "" });
      loadAdmins();
    } catch (error: any) {
      toast.error("Failed to create admin: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Mass messaging functions
  const handleSendMassMessage = async () => {
    try {
      if (massMessageForm.type === "notification") {
        if (!massMessageForm.title.trim() || !massMessageForm.message.trim()) {
          toast.error("Title and message are required");
          return;
        }

        setIsLoading(true);
        const response = await apiService.sendNotificationToAllUsers({
          title: massMessageForm.title,
          message: massMessageForm.message,
        });

        // Show detailed success message
        if (response && response.data) {
          toast.success(
            `Push notification sent successfully! Delivered to ${response.data.success_count} devices out of ${response.data.total_users} users.`,
          );
        } else {
          toast.success("Push notification sent to all users successfully!");
        }
      } else {
        if (
          !massMessageForm.subject.trim() ||
          !massMessageForm.message.trim()
        ) {
          toast.error("Subject and message are required");
          return;
        }

        setIsLoading(true);
        const response = await apiService.sendEmailToAllUsers({
          subject: massMessageForm.subject,
          message: massMessageForm.message,
        });

        // Show detailed success message
        if (response && response.data) {
          toast.success(
            `Mass email sent successfully! Delivered to ${response.data.success_count} users out of ${response.data.total_users} users.`,
          );
        } else {
          toast.success("Mass email sent to all users successfully!");
        }
      }

      setMessageDialogOpen(false);
      setMassMessageForm({
        type: "notification",
        title: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Mass message error:", error);

      // Show more specific error messages
      if (
        error.message.includes("No users") ||
        error.message.includes("No active users")
      ) {
        if (massMessageForm.type === "notification") {
          toast.error(
            "No users with valid FCM tokens found. Users need to install the mobile app and allow notifications to receive push notifications.",
          );
        } else {
          toast.error(
            "No active users found to send emails to. Please ensure users are registered and active.",
          );
        }
      } else if (error.message.includes("Firebase credentials")) {
        toast.error(
          "Push notification service is not configured. Please contact system administrator.",
        );
      } else if (error.message.includes("Validation Error")) {
        toast.error("Please check your input. Title and message are required.");
      } else {
        toast.error(
          "Failed to send message: " +
            (error.message || "Unknown error occurred"),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Event management functions
  const handleCreateEvent = async () => {
    try {
      if (
        !eventForm.title.trim() ||
        !eventForm.description.trim() ||
        !eventForm.location.trim()
      ) {
        toast.error("Title, description, and location are required");
        return;
      }

      if (
        !eventForm.event_date ||
        !eventForm.start_time ||
        !eventForm.end_time
      ) {
        toast.error("Event date and times are required");
        return;
      }

      if (!eventForm.category_id || eventForm.category_id === 0) {
        toast.error("Please select a category");
        return;
      }

      if (!eventForm.organizer_id || eventForm.organizer_id === 0) {
        toast.error("Please select an organizer");
        return;
      }

      setIsLoading(true);
      await apiService.createEvent(eventForm);
      toast.success("Event created successfully");
      setEventDialogOpen(false);
      resetEventForm();
      loadEvents();
    } catch (error: any) {
      toast.error("Failed to create event: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    try {
      if (
        !selectedEvent ||
        !eventForm.title.trim() ||
        !eventForm.description.trim()
      ) {
        toast.error("Title and description are required");
        return;
      }

      setIsLoading(true);
      await apiService.updateEvent({
        id: selectedEvent.id,
        ...eventForm,
      });
      toast.success("Event updated successfully");
      setEventDialogOpen(false);
      setSelectedEvent(null);
      resetEventForm();
      loadEvents();
    } catch (error: any) {
      toast.error("Failed to update event: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      setIsLoading(true);
      await apiService.deleteEvent(eventId);
      toast.success("Event deleted successfully");
      loadEvents();
    } catch (error: any) {
      toast.error("Failed to delete event: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventStatusChange = async (
    eventId: number,
    newStatus: string,
  ) => {
    try {
      setIsLoading(true);
      await apiService.updateEventStatus(eventId, newStatus);
      toast.success(`Event ${newStatus} successfully`);
      loadEvents();
    } catch (error: any) {
      toast.error("Failed to update event status: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetEventForm = () => {
    setEventForm({
      title: "",
      description: "",
      category_id: 0,
      location: "",
      event_date: "",
      start_time: "",
      end_time: "",
      max_participants: 50,
      organizer_id: 0,
      status: "active",
      image_url: "",
      requirements: [],
      contact_info: "",
      is_featured: false,
      registration_deadline: "",
      event_type: "charity",
      tags: [],
    });
  };

  // Form Options CRUD Functions
  const handleCreateFormOption = async () => {
    try {
      if (!formOptionForm.name.trim()) {
        toast.error("Name is required");
        return;
      }

      setIsLoading(true);
      await apiService.createFormOption(formOptionForm);
      toast.success("Form option created successfully");
      setFormOptionDialogOpen(false);
      resetFormOptionForm();
      loadFormOptions();
    } catch (error: any) {
      toast.error("Failed to create form option: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFormOption = async () => {
    try {
      if (!selectedFormOption || !formOptionForm.name.trim()) {
        toast.error("Name is required");
        return;
      }

      setIsLoading(true);
      await apiService.updateFormOption({
        id: selectedFormOption.id,
        ...formOptionForm,
      });
      toast.success("Form option updated successfully");
      setFormOptionDialogOpen(false);
      setSelectedFormOption(null);
      resetFormOptionForm();
      loadFormOptions();
    } catch (error: any) {
      toast.error("Failed to update form option: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFormOption = async (optionId: number) => {
    try {
      setIsLoading(true);
      await apiService.deleteFormOption(optionId);
      toast.success("Form option deleted successfully");
      loadFormOptions();
    } catch (error: any) {
      toast.error("Failed to delete form option: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFormOptionStatus = async (optionId: number) => {
    try {
      setIsLoading(true);
      await apiService.toggleFormOptionStatus(optionId);
      toast.success("Form option status updated successfully");
      loadFormOptions();
    } catch (error: any) {
      toast.error("Failed to update form option status: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormOptionForm = () => {
    setFormOptionForm({
      type: "education",
      name: "",
      value: "",
      description: "",
      is_active: true,
      sort_order: 0,
    });
  };

  const openFormOptionDialog = (option?: any) => {
    if (option) {
      setSelectedFormOption(option);
      setFormOptionForm({
        type: option.type,
        name: option.name,
        value: option.value || "",
        description: option.description || "",
        is_active: option.is_active,
        sort_order: option.sort_order,
      });
    } else {
      setSelectedFormOption(null);
      resetFormOptionForm();
      setFormOptionForm((prev) => ({ ...prev, type: selectedFormOptionType }));
    }
    setFormOptionDialogOpen(true);
  };

  // Open dialogs with data
  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setCategoryForm({
        name: category.name,
        status: category.status,
        max_guests: category.max_guests || 4,
      });
    } else {
      setSelectedCategory(null);
      setCategoryForm({ name: "", status: "active", max_guests: 4 });
    }
    setCategoryDialogOpen(true);
  };

  const openSettingDialog = (setting?: Setting) => {
    if (setting) {
      setSelectedSetting(setting);
      setSettingForm({
        key: setting.key,
        value: setting.value,
        type: setting.type,
      });
    } else {
      setSelectedSetting(null);
      setSettingForm({ key: "", value: "", type: "string" });
    }
    setSettingDialogOpen(true);
  };

  const openPageDialog = (page?: Page) => {
    if (page) {
      // Edit existing page
      setSelectedPage(page);
      setPageForm({
        title: page.title || page.name || "",
        content: page.content,
        status: page.status,
      });
    } else {
      // Create new page
      setSelectedPage(null);
      setPageForm({
        title: "",
        content: "",
        status: "active",
      });
    }
    setPageDialogOpen(true);
  };

  const openContactDialog = (contact: Contact) => {
    setSelectedContact(contact);
    setReplyForm({
      subject: `Re: Contact Form Inquiry from ${contact.name}`,
      message: `Dear ${contact.name},\n\nThank you for reaching out to us. `,
    });
    setContactDialogOpen(true);
  };

  const openEventDialog = (event?: Event) => {
    if (event) {
      setSelectedEvent(event);
      setEventForm({
        title: event.title,
        description: event.description,
        category_id: event.category_id,
        location: event.location,
        event_date: event.event_date,
        start_time: event.start_time
          ? new Date(event.start_time).toTimeString().slice(0, 5)
          : "",
        end_time: event.end_time
          ? new Date(event.end_time).toTimeString().slice(0, 5)
          : "",
        max_participants: event.max_participants,
        organizer_id: event.organizer_id,
        status: event.status,
        image_url: event.image_url || "",
        requirements: event.requirements || [],
        contact_info: event.contact_info || "",
        is_featured: event.is_featured,
        registration_deadline: event.registration_deadline
          ? new Date(event.registration_deadline).toISOString().slice(0, 16)
          : "",
        event_type: event.event_type,
        tags: event.tags || [],
      });
    } else {
      setSelectedEvent(null);
      resetEventForm();
    }
    setEventDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Share2care Foundation - Administrative Panel
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setMessageDialogOpen(true)}
                className="border-blue-300 text-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Mass Message
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg flex items-center space-x-3">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span>Loading...</span>
              </div>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardStats?.total_users || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Registered platform users
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending Users
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardStats?.pending_users || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting approval
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Events
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardStats?.active_events || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Currently running
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Contacts
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardStats?.total_contacts || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Support inquiries
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Users */}
              {dashboardStats?.recent_users &&
                dashboardStats.recent_users.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Users</CardTitle>
                      <CardDescription>
                        Latest user registrations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full max-w-5xl scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-200 overflow-x-auto max-h-[500px] overflow-y-auto">
                        <Table className="min-w-max">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Registration Date</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dashboardStats.recent_users.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  {new Date(
                                    user.created_at,
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      user.status === "active"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {user.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Recent Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Contacts</CardTitle>
                  <CardDescription>Latest support inquiries</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.recent_contacts &&
                  dashboardStats.recent_contacts.length > 0 ? (
                    <div className="w-full scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-200 max-w-5xl overflow-x-auto max-h-[500px] overflow-y-auto">
                      <Table className="min-w-max">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dashboardStats.recent_contacts.map((contact) => (
                            <TableRow key={contact.id}>
                              <TableCell>{contact.name}</TableCell>
                              <TableCell>{contact.email}</TableCell>
                              <TableCell>
                                {contact.phone || contact.mobile || "N/A"}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {contact.subject || contact.message}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  contact.created_at,
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    contact.status === "pending"
                                      ? "destructive"
                                      : contact.status === "replied"
                                        ? "default"
                                        : "secondary"
                                  }
                                >
                                  {contact.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No recent contacts</p>
                      <p className="text-sm">
                        Contact inquiries will appear here when submitted
                      </p>
                      {/* Debug info - remove in production */}
                      <div className="mt-4 text-xs bg-gray-100 p-2 rounded">
                        Debug: dashboardStats ={" "}
                        {JSON.stringify(dashboardStats?.recent_contacts)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6 overflow-x-hidden">
              <div className="flex justify-between items-center ">
                <h2 className="text-2xl font-bold">User Management</h2>
                <Button onClick={loadUsers}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Pending Approvals Card */}
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800">
                    Pending User Approvals (
                    {users?.filter(
                      (user) =>
                        !user.approval_status ||
                        user.approval_status === "pending",
                    ).length || 0}
                    )
                  </CardTitle>
                  <CardDescription className="text-orange-600">
                    Users waiting for profile approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {users?.filter(
                    (user) =>
                      !user.approval_status ||
                      user.approval_status === "pending",
                  ).length > 0 ? (
                    <div className="space-y-2">
                      {users
                        .filter(
                          (user) =>
                            !user.approval_status ||
                            user.approval_status === "pending",
                        )
                        .slice(0, 5)
                        .map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border"
                          >
                            <div className="flex items-center space-x-3">
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-gray-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={async () => {
                                  const { value: comments } = await Swal.fire({
                                    title: "Approve User",
                                    text: "Add approval comments (optional):",
                                    input: "textarea",
                                    inputPlaceholder:
                                      "Enter your comments here...",
                                    showCancelButton: true,
                                    confirmButtonText: "Approve",
                                    confirmButtonColor: "#16a34a",
                                    cancelButtonText: "Cancel",
                                    inputValidator: () => {
                                      // No validation needed as comments are optional
                                      return null;
                                    },
                                  });
                                  if (comments !== undefined) {
                                    handleUserApproval(
                                      user.id,
                                      "approved",
                                      comments || undefined,
                                    );
                                  }
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={async () => {
                                  const { value: comments } = await Swal.fire({
                                    title: "Reject User",
                                    text: "Please provide reason for rejection:",
                                    input: "textarea",
                                    inputPlaceholder:
                                      "Enter rejection reason...",
                                    showCancelButton: true,
                                    confirmButtonText: "Reject",
                                    confirmButtonColor: "#dc2626",
                                    cancelButtonText: "Cancel",
                                    inputValidator: (value) => {
                                      if (!value || value.trim() === "") {
                                        return "Rejection reason is required!";
                                      }
                                      return null;
                                    },
                                  });
                                  if (comments) {
                                    handleUserApproval(
                                      user.id,
                                      "rejected",
                                      comments,
                                    );
                                  }
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      {users.filter(
                        (user) =>
                          !user.approval_status ||
                          user.approval_status === "pending",
                      ).length > 5 && (
                        <p className="text-sm text-gray-500 text-center">
                          And{" "}
                          {users.filter(
                            (user) =>
                              !user.approval_status ||
                              user.approval_status === "pending",
                          ).length - 5}{" "}
                          more pending approvals...
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No pending approvals
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>All Users ({users?.length || 0})</CardTitle>

                  <CardDescription>
                    Manage user accounts and their information
                  </CardDescription>
                </CardHeader>
                <div className="px-6 flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search by name, mobile, email, location"
                    className="mb-4 w-1/4 max-md:w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="mb-4 w-1/4 max-md:w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                    title="Filter by registration date"
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="mb-4 w-1/4 max-md:w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <select
                    value={approvalFilter}
                    onChange={(e) => {
                      setApprovalFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="mb-4 w-1/4 max-md:w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  >
                    <option value="">All Approvals</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span className="ml-2">Loading users...</span>
                    </div>
                  ) : users && users.length > 0 ? (
                    <div className="w-full max-w-5xl scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-200 overflow-x-auto max-h-[500px] overflow-y-auto">
                      <Table className="min-w-max">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Registration Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Approval Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                {user.name}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.mobile}</TableCell>
                              <TableCell>{user.age || "N/A"}</TableCell>
                              <TableCell>{user.location || "N/A"}</TableCell>
                              <TableCell>
                                {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    user.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    user.approval_status === "approved"
                                      ? "default"
                                      : user.approval_status === "rejected"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                >
                                  {user.approval_status || "pending"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      loadUserDetails(user.id);
                                      setUserDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {user.status === "active" ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleUserStatusChange(
                                          user.id,
                                          "inactive",
                                        )
                                      }
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <UserX className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleUserStatusChange(
                                          user.id,
                                          "active",
                                        )
                                      }
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <UserCheck className="w-4 h-4" />
                                    </Button>
                                  )}

                                  {/* Approval Actions */}
                                  {user.approval_status !== "approved" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={async () => {
                                        const { value: comments } =
                                          await Swal.fire({
                                            title: "Approve User",
                                            text: "Add approval comments (optional):",
                                            input: "textarea",
                                            inputPlaceholder:
                                              "Enter your comments here...",
                                            showCancelButton: true,
                                            confirmButtonText: "Approve",
                                            confirmButtonColor: "#16a34a",
                                            cancelButtonText: "Cancel",
                                            inputValidator: () => {
                                              // No validation needed as comments are optional
                                              return null;
                                            },
                                          });
                                        if (comments !== undefined) {
                                          handleUserApproval(
                                            user.id,
                                            "approved",
                                            comments || undefined,
                                          );
                                        }
                                      }}
                                      className="text-green-600 hover:text-green-700"
                                      title="Approve User"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                  )}

                                  {user.approval_status !== "rejected" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={async () => {
                                        const { value: comments } =
                                          await Swal.fire({
                                            title: "Reject User",
                                            text: "Please provide reason for rejection:",
                                            input: "textarea",
                                            inputPlaceholder:
                                              "Enter rejection reason...",
                                            showCancelButton: true,
                                            confirmButtonText: "Reject",
                                            confirmButtonColor: "#dc2626",
                                            cancelButtonText: "Cancel",
                                            inputValidator: (value) => {
                                              if (
                                                !value ||
                                                value.trim() === ""
                                              ) {
                                                return "Rejection reason is required!";
                                              }
                                              return null;
                                            },
                                          });
                                        if (comments) {
                                          handleUserApproval(
                                            user.id,
                                            "rejected",
                                            comments,
                                          );
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-700"
                                      title="Reject User"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No users found</p>
                    </div>
                  )}
                  <div className="flex justify-center my-4">
                    <button
                      className="border bg-gray-200 px-3 py-1 mx-1 rounded disabled:opacity-50"
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>
                    {[...Array(totalPages).keys()].map((idx) => (
                      <button
                        key={idx}
                        className={`border px-3 py-1 mx-1 rounded ${currentPage === idx + 1 ? "bg-gray-500 text-white" : "bg-gray-200"}`}
                        onClick={() => setCurrentPage(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      className="border bg-gray-200 px-3 py-1 mx-1 rounded disabled:opacity-50"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Database Tab (Categories) */}
          {activeTab === "database" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Categories Management</h2>
                <div className="space-x-2">
                  <Button onClick={() => openCategoryDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                  <Button variant="outline" onClick={loadCategories}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Skill Categories</CardTitle>
                  <CardDescription>
                    Manage skill categories and their settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full max-w-5xl overflow-x-auto max-h-[500px] overflow-y-auto">
                    <Table className="min-w-max">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Max Guests</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell>{category.name}</TableCell>
                            <TableCell>
                              {category.max_guests || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  category.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {category.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(
                                category.created_at,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openCategoryDialog(category)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Category
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this
                                        category? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteCategory(category.id)
                                        }
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Settings Management</h2>
                <div className="space-x-2">
                  <Button onClick={() => openSettingDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Setting
                  </Button>
                  <Button variant="outline" onClick={loadSettings}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Authentication Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Authentication Settings</CardTitle>
                  <CardDescription>
                    Configure user authentication and OTP delivery methods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="otp-method">OTP Delivery Method</Label>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`text-sm ${otpMethod === "email" ? "font-medium text-green-600" : "text-gray-500"}`}
                          >
                            Email
                          </span>
                          <Switch
                            checked={otpMethod === "mobile"}
                            onCheckedChange={(checked) =>
                              setOtpMethod(checked ? "mobile" : "email")
                            }
                          />
                          <span
                            className={`text-sm ${otpMethod === "mobile" ? "font-medium text-blue-600" : "text-gray-500"}`}
                          >
                            Mobile
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {otpMethod === "email"
                            ? "Users will receive OTP codes via email"
                            : "Users will receive OTP codes via SMS to their mobile number"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Current Setting</Label>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-sm font-medium capitalize">
                            {originalOtpMethod} OTP
                          </p>
                          <p className="text-xs text-gray-500">
                            Currently active method
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Actions</Label>
                        <div className="space-y-2">
                          <Button
                            onClick={saveOtpMethod}
                            disabled={
                              isSavingOtpMethod ||
                              otpMethod === originalOtpMethod
                            }
                            className="w-full"
                          >
                            {isSavingOtpMethod ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setOtpMethod(originalOtpMethod)}
                            disabled={otpMethod === originalOtpMethod}
                            className="w-full"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>

                    {otpMethod !== originalOtpMethod && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          <AlertTriangle className="w-4 h-4 inline mr-1" />
                          You have unsaved changes. Click "Save Changes" to
                          apply the new OTP method.
                        </p>
                      </div>
                    )}

                    {/* Preview Section */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">
                        How OTP Authentication Works
                      </h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        {otpMethod === "email" ? (
                          <>
                            <p>
                              • Users enter their email address on the login
                              page
                            </p>
                            <p>• A 6-digit OTP code is sent to their email</p>
                            <p>
                              • Users enter the OTP to complete authentication
                            </p>
                            <p>
                              • New users can also provide their name during
                              verification
                            </p>
                          </>
                        ) : (
                          <>
                            <p>
                              • Users enter their mobile number on the login
                              page
                            </p>
                            <p>
                              • A 6-digit OTP code is sent via SMS using Twilio
                            </p>
                            <p>
                              • Users enter the OTP to complete authentication
                            </p>
                            <p>
                              • New users can also provide their name during
                              verification
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Management Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Management Settings</CardTitle>
                  <CardDescription>
                    Configure event-related settings and time limits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="event-edit-time-limit">
                          Event Edit Time Limit (Hours)
                        </Label>
                        <Select
                          value={eventEditTimeLimit}
                          onValueChange={setEventEditTimeLimit}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time limit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Hour</SelectItem>
                            <SelectItem value="2">2 Hours</SelectItem>
                            <SelectItem value="6">6 Hours</SelectItem>
                            <SelectItem value="12">12 Hours</SelectItem>
                            <SelectItem value="15">15 Hours</SelectItem>
                            <SelectItem value="24">
                              24 Hours (Default)
                            </SelectItem>
                            <SelectItem value="48">48 Hours</SelectItem>
                            <SelectItem value="72">72 Hours</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500">
                          Users cannot edit or manage events within this time
                          limit before the event starts
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Current Setting</Label>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-sm font-medium">
                            {settings.find(
                              (s) => s.key === "event_edit_time_limit",
                            )?.value || "24"}{" "}
                            Hours
                          </p>
                          <p className="text-xs text-gray-500">
                            Last updated:{" "}
                            {settings.find(
                              (s) => s.key === "event_edit_time_limit",
                            )?.updated_at
                              ? new Date(
                                  settings.find(
                                    (s) => s.key === "event_edit_time_limit",
                                  )?.updated_at,
                                ).toLocaleString()
                              : "Not set"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Actions</Label>
                        <div className="space-y-2">
                          <Button
                            onClick={saveEventEditTimeLimit}
                            disabled={
                              isSavingTimeLimit ||
                              eventEditTimeLimit ===
                                (settings.find(
                                  (s) => s.key === "event_edit_time_limit",
                                )?.value || "24")
                            }
                            className="w-full"
                          >
                            {isSavingTimeLimit ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              setEventEditTimeLimit(
                                settings.find(
                                  (s) => s.key === "event_edit_time_limit",
                                )?.value || "24",
                              )
                            }
                            disabled={
                              eventEditTimeLimit ===
                              (settings.find(
                                (s) => s.key === "event_edit_time_limit",
                              )?.value || "24")
                            }
                            className="w-full"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>

                    {eventEditTimeLimit !==
                      (settings.find((s) => s.key === "event_edit_time_limit")
                        ?.value || "24") && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          <AlertTriangle className="w-4 h-4 inline mr-1" />
                          You have unsaved changes. Click "Save Changes" to
                          apply the new time limit.
                        </p>
                      </div>
                    )}

                    {/* Preview Section */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">
                        Preview: How this setting works
                      </h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>
                          • If an event is scheduled for{" "}
                          <strong>tomorrow at 2:00 PM</strong>
                        </p>
                        <p>
                          • Users can edit/manage it until{" "}
                          <strong>
                            {(() => {
                              const tomorrow = new Date();
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              tomorrow.setHours(14, 0, 0, 0); // 2:00 PM
                              const cutoffTime = new Date(
                                tomorrow.getTime() -
                                  parseInt(eventEditTimeLimit) * 60 * 60 * 1000,
                              );
                              return cutoffTime.toLocaleString();
                            })()}
                          </strong>
                        </p>
                        <p>
                          • After that time, Edit and Manage buttons will be
                          disabled
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>All Application Settings</CardTitle>
                  <CardDescription>
                    Configure all application settings and parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full max-w-5xl overflow-x-auto max-h-[500px] overflow-y-auto">
                    <Table className="min-w-max">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Key</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Updated Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {settings.map((setting) => (
                          <TableRow key={setting.id}>
                            <TableCell>{setting.key}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {setting.value}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{setting.type}</Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(
                                setting.updated_at,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openSettingDialog(setting)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Setting
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this
                                        setting? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteSetting(setting.id)
                                        }
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Form Options Tab */}
          {activeTab === "form-options" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Form Options Management</h2>
                <div className="space-x-2">
                  <Button onClick={() => openFormOptionDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                  <Button variant="outline" onClick={loadFormOptions}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Type Filter */}
              <div className="flex space-x-2">
                <Label htmlFor="type-filter">Filter by Type:</Label>
                <Select
                  value={selectedFormOptionType}
                  onValueChange={setSelectedFormOptionType}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="skills">Skills/Topics</SelectItem>
                    <SelectItem value="diseases">Diseases</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedFormOptionType.charAt(0).toUpperCase() +
                      selectedFormOptionType.slice(1)}{" "}
                    Options
                  </CardTitle>
                  <CardDescription>
                    Manage {selectedFormOptionType} dropdown options for user
                    forms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full max-w-5xl overflow-x-auto max-h-[500px] overflow-y-auto">
                    <Table className="min-w-max">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Sort Order</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formOptions[selectedFormOptionType]?.map(
                          (option: any) => (
                            <TableRow key={option.id}>
                              <TableCell>{option.name}</TableCell>
                              <TableCell className="font-mono text-sm">
                                {option.value}
                              </TableCell>
                              <TableCell>{option.sort_order}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    option.is_active ? "default" : "secondary"
                                  }
                                >
                                  {option.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openFormOptionDialog(option)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleToggleFormOptionStatus(option.id)
                                    }
                                  >
                                    {option.is_active ? (
                                      <Ban className="w-4 h-4" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Delete Form Option
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "
                                          {option.name}"? This action cannot be
                                          undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDeleteFormOption(option.id)
                                          }
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Terms Tab */}
          {activeTab === "terms" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Terms & Conditions</h2>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={loadPages}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={() => openPageDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Page
                  </Button>
                </div>
              </div>

              <div className="grid gap-6">
                {Array.isArray(pages) &&
                  pages.map((page) => (
                    <Card key={page.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{page.title || page.name}</CardTitle>
                            <CardDescription>
                              Last updated:{" "}
                              {new Date(page.updated_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex space-x-2">
                            <Badge
                              variant={
                                page.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {page.status}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPageDialog(page)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Page
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "
                                    {page.title || page.name}"? This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePage(page.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 line-clamp-3">
                            {page.content.substring(0, 300)}...
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === "contacts" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Contact Management</h2>
                <Button variant="outline" onClick={loadContacts}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Inquiries</CardTitle>
                  <CardDescription>
                    Manage and respond to user inquiries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full max-w-5xl overflow-x-auto max-h-[500px] overflow-y-auto">
                    <Table className="min-w-max">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contacts.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell>{contact.name}</TableCell>
                            <TableCell>{contact.email}</TableCell>
                            <TableCell>
                              {contact.phone || contact.mobile || "N/A"}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {contact.subject}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {contact.message}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                contact.created_at,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  contact.status === "replied"
                                    ? "default"
                                    : contact.status === "pending"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {contact.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openContactDialog(contact)}
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Events Management</h2>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={loadEvents}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={() => openEventDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Events</CardTitle>
                  <CardDescription>
                    Manage charity events, volunteer activities, and community
                    programs
                  </CardDescription>
                  <div className="flex flex-col gap-2 md:flex-row md:gap-4 mb-4">
                    <input
                      type="text"
                      value={searchTermEvent}
                      onChange={(e) => {
                        setSearchTermEvent(e.target.value);
                        setCurrentPageEvent(1);
                      }}
                      placeholder="Search by title, location, mobile, username, category, event type"
                      className="mb-4 w-1/4 max-md:w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                    />

                    <input
                      type="date"
                      value={selectedDateEvent}
                      onChange={(e) => {
                        setSelectedDateEvent(e.target.value);
                        setCurrentPageEvent(1);
                      }}
                      className="mb-4 w-1/4 max-md:w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                      title="Filter by event date"
                    />

                    <select
                      value={statusFilterEvent}
                      onChange={(e) => {
                        setStatusFilterEvent(e.target.value);
                        setCurrentPageEvent(1);
                      }}
                      className="mb-4 w-1/4 max-md:w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>

                    <select
                      value={featuredFilterEvent}
                      onChange={(e) => {
                        setFeaturedFilterEvent(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="mb-4 w-1/4 max-md:w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                    >
                      <option value="">All Events</option>
                      <option value="featured">Featured</option>
                      <option value="not_featured">Not Featured</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full max-w-5xl scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-200 overflow-x-auto max-h-[500px] overflow-y-auto">
                    <Table className="min-w-max">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Participants</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="text-gray-500">
                                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">
                                  No events found
                                </p>
                                <p className="text-sm">
                                  Create your first event to get started
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedEvents.map((event) => (
                            <TableRow key={event.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {event.title}
                                  </div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {event.description}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {event.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {new Date(
                                      event.event_date,
                                    ).toLocaleDateString()}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(
                                      event.start_time,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}{" "}
                                    -{" "}
                                    {new Date(
                                      event.end_time,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {event.location}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>
                                    {event.current_participants}/
                                    {event.max_participants}
                                  </div>
                                  <div className="text-gray-500">
                                    {event.available_spots} spots left
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    event.status === "active"
                                      ? "default"
                                      : event.status === "completed"
                                        ? "secondary"
                                        : event.status === "cancelled"
                                          ? "destructive"
                                          : "outline"
                                  }
                                >
                                  {event.status}
                                </Badge>
                                {event.is_featured && (
                                  <Badge variant="outline" className="ml-1">
                                    <Star className="w-3 h-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEventDialog(event)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Select
                                    value={event.status}
                                    onValueChange={(value) =>
                                      handleEventStatusChange(event.id, value)
                                    }
                                  >
                                    <SelectTrigger className="w-24 h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">
                                        Active
                                      </SelectItem>
                                      <SelectItem value="inactive">
                                        Inactive
                                      </SelectItem>
                                      <SelectItem value="completed">
                                        Completed
                                      </SelectItem>
                                      <SelectItem value="cancelled">
                                        Cancelled
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Delete Event
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this
                                          event? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDeleteEvent(event.id)
                                          }
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-center my-4">
                    <button
                      className="border bg-gray-200 px-3 py-1 mx-1 rounded disabled:opacity-50"
                      onClick={() => setCurrentPageEvent((p) => Math.max(p - 1, 1))}
                      disabled={currentPageEvent === 1}
                    >
                      Prev
                    </button>

                    {[...Array(totalPages).keys()].map((idx) => (
                      <button
                        key={idx}
                        className={`border px-3 py-1 mx-1 rounded ${currentPageEvent === idx + 1 ? "bg-gray-500 text-white" : "bg-gray-200"}`}
                        onClick={() => setCurrentPageEvent(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    ))}

                    <button
                      className="border bg-gray-200 px-3 py-1 mx-1 rounded disabled:opacity-50"
                      onClick={() =>
                        setCurrentPageEvent((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPageEvent === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Reviews Management</h2>
                <Button variant="outline" onClick={() => loadReviews()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Reviews Statistics */}
              {reviewsStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Reviews
                      </CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {reviewsStats.total_reviews}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        All time reviews
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Average Rating
                      </CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {reviewsStats.average_rating
                          ? reviewsStats.average_rating.toFixed(1)
                          : "0.0"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Out of 5 stars
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        5 Star Reviews
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {reviewsStats.rating_distribution?.["5"] || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Excellent ratings
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Low Ratings
                      </CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(reviewsStats.rating_distribution?.["1"] || 0) +
                          (reviewsStats.rating_distribution?.["2"] || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        1-2 star reviews
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Filter Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="search">Search</Label>
                      <Input
                        id="search"
                        placeholder="Search by reviewer name, event title, or review content..."
                        value={reviewsFilters.search}
                        onChange={(e) => {
                          setReviewsFilters({
                            ...reviewsFilters,
                            search: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rating">Rating</Label>
                      <Select
                        value={reviewsFilters.rating}
                        onValueChange={(value) => {
                          setReviewsFilters({
                            ...reviewsFilters,
                            rating: value,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All ratings" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All ratings</SelectItem>
                          <SelectItem value="5">5 stars</SelectItem>
                          <SelectItem value="4">4 stars</SelectItem>
                          <SelectItem value="3">3 stars</SelectItem>
                          <SelectItem value="2">2 stars</SelectItem>
                          <SelectItem value="1">1 star</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={() => loadReviews(1)} className="w-full">
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Reviews</CardTitle>
                  <CardDescription>
                    View and manage all event reviews from users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reviewer</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Review</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex flex-col items-center space-y-2">
                              <MessageSquare className="w-8 h-8 text-gray-400" />
                              <p className="text-gray-500">No reviews found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        reviews.map((review) => (
                          <TableRow key={review.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {review.reviewer_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {review.user_id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium max-w-xs truncate">
                                  {review.event_title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {review.event_date
                                    ? new Date(
                                        review.event_date,
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 text-sm font-medium">
                                  {review.rating}/5
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-md">
                                {review.review ? (
                                  <p className="text-sm line-clamp-3">
                                    {review.review}
                                  </p>
                                ) : (
                                  <span className="text-gray-400 italic">
                                    No review text
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {review.formatted_date || "N/A"}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {reviewsPagination.total > 0 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Showing{" "}
                        {(reviewsPagination.current_page - 1) *
                          reviewsPagination.per_page +
                          1}{" "}
                        to{" "}
                        {Math.min(
                          reviewsPagination.current_page *
                            reviewsPagination.per_page,
                          reviewsPagination.total,
                        )}{" "}
                        of {reviewsPagination.total} reviews
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            loadReviews(reviewsPagination.current_page - 1)
                          }
                          disabled={reviewsPagination.current_page <= 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            loadReviews(reviewsPagination.current_page + 1)
                          }
                          disabled={!reviewsPagination.has_more}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Analytics & Reports</h2>
                <div className="flex items-center space-x-4">
                  <Select
                    value={selectedReportPeriod}
                    onValueChange={setSelectedReportPeriod}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                      <SelectItem value="last_3_months">
                        Last 3 Months
                      </SelectItem>
                      <SelectItem value="last_6_months">
                        Last 6 Months
                      </SelectItem>
                      <SelectItem value="last_year">Last Year</SelectItem>
                      <SelectItem value="all_time">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={loadReportsData}
                    disabled={reportsLoading}
                    variant="outline"
                  >
                    {reportsLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </div>

              {reportsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin mr-3" />
                  <span className="text-lg">Loading reports data...</span>
                </div>
              ) : reportsData ? (
                <>
                  {/* Report Type Tabs */}
                  <Tabs
                    value={selectedReportType}
                    onValueChange={setSelectedReportType}
                  >
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="users">Users</TabsTrigger>
                      <TabsTrigger value="events">Events</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {reportsData.overview.total_users}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {reportsData.overview.active_users} active,{" "}
                              {reportsData.overview.pending_users} pending
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Total Events
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {reportsData.overview.total_events}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {reportsData.overview.active_events} active,{" "}
                              {reportsData.overview.completed_events} completed
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Reviews & Rating
                            </CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {reportsData.overview.total_reviews}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Avg rating:{" "}
                              {reportsData.overview.average_rating.toFixed(1)}/5
                            </p>
                          </CardContent>
                        </Card> 

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Contact Inquiries
                            </CardTitle>
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {reportsData.overview.total_contacts}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Total inquiries received
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users" className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Registrations Chart */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Monthly User Registrations</CardTitle>
                            <CardDescription>
                              User registration trends over time
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {reportsData.userStats.monthly_registrations &&
                              reportsData.userStats.monthly_registrations
                                .length > 0 ? (
                                reportsData.userStats.monthly_registrations.map(
                                  (item, index) => {
                                    const maxCount = Math.max(
                                      ...reportsData.userStats.monthly_registrations.map(
                                        (r) => r.count,
                                      ),
                                      1,
                                    );
                                    return (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between"
                                      >
                                        <span className="text-sm font-medium">
                                          {item.month}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                          <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                              className="bg-blue-600 h-2 rounded-full"
                                              style={{
                                                width: `${Math.min((item.count / maxCount) * 100, 100)}%`,
                                              }}
                                            ></div>
                                          </div>
                                          <span className="text-sm font-bold w-8 text-right">
                                            {item.count}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  },
                                )
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>
                                    No registration data available for this
                                    period
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* User Status Distribution */}
                        <Card>
                          <CardHeader>
                            <CardTitle>User Status Distribution</CardTitle>
                            <CardDescription>
                              Breakdown of user approval status
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {reportsData.userStats.user_status_distribution &&
                              reportsData.userStats.user_status_distribution
                                .length > 0 ? (
                                reportsData.userStats.user_status_distribution.map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between"
                                    >
                                      <span className="text-sm font-medium capitalize">
                                        {item.status}
                                      </span>
                                      <div className="flex items-center space-x-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                          <div
                                            className={`h-2 rounded-full ${
                                              item.status === "approved"
                                                ? "bg-green-600"
                                                : item.status === "pending"
                                                  ? "bg-yellow-600"
                                                  : "bg-red-600"
                                            }`}
                                            style={{
                                              width: `${item.percentage || 0}%`,
                                            }}
                                          ></div>
                                        </div>
                                        <span className="text-sm font-bold w-12 text-right">
                                          {item.count} ({item.percentage || 0}%)
                                        </span>
                                      </div>
                                    </div>
                                  ),
                                )
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>No user status data available</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Top Locations */}
                        <Card className="lg:col-span-2">
                          <CardHeader>
                            <CardTitle>Top User Locations</CardTitle>
                            <CardDescription>
                              Most popular user locations
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {reportsData.userStats.top_locations &&
                              reportsData.userStats.top_locations.length > 0 ? (
                                reportsData.userStats.top_locations.map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium">
                                          {item.location || "Not specified"}
                                        </span>
                                      </div>
                                      <Badge variant="secondary">
                                        {item.count}
                                      </Badge>
                                    </div>
                                  ),
                                )
                              ) : (
                                <div className="col-span-full text-center py-8 text-gray-500">
                                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>No location data available</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Events Tab */}
                    <TabsContent value="events" className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Events Chart */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Monthly Event Creation</CardTitle>
                            <CardDescription>
                              Events created over time
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {reportsData.eventStats.monthly_events &&
                              reportsData.eventStats.monthly_events.length >
                                0 ? (
                                reportsData.eventStats.monthly_events.map(
                                  (item, index) => {
                                    const maxCount = Math.max(
                                      ...reportsData.eventStats.monthly_events.map(
                                        (r) => r.count,
                                      ),
                                      1,
                                    );
                                    return (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between"
                                      >
                                        <span className="text-sm font-medium">
                                          {item.month}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                          <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                              className="bg-green-600 h-2 rounded-full"
                                              style={{
                                                width: `${Math.min((item.count / maxCount) * 100, 100)}%`,
                                              }}
                                            ></div>
                                          </div>
                                          <span className="text-sm font-bold w-8 text-right">
                                            {item.count}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  },
                                )
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>
                                    No event creation data available for this
                                    period
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Events by Category */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Events by Category</CardTitle>
                            <CardDescription>
                              Distribution of events across categories
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {reportsData.eventStats.events_by_category &&
                              reportsData.eventStats.events_by_category.length >
                                0 ? (
                                reportsData.eventStats.events_by_category.map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between"
                                    >
                                      <span className="text-sm font-medium">
                                        {item.category}
                                      </span>
                                      <div className="flex items-center space-x-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                          <div
                                            className="bg-purple-600 h-2 rounded-full"
                                            style={{
                                              width: `${item.percentage || 0}%`,
                                            }}
                                          ></div>
                                        </div>
                                        <span className="text-sm font-bold w-12 text-right">
                                          {item.count} ({item.percentage || 0}%)
                                        </span>
                                      </div>
                                    </div>
                                  ),
                                )
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>No category data available</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Participation Stats */}
                        <Card className="lg:col-span-2">
                          <CardHeader>
                            <CardTitle>
                              Event Participation Statistics
                            </CardTitle>
                            <CardDescription>
                              Monthly participation trends
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {reportsData.eventStats.participation_stats &&
                              reportsData.eventStats.participation_stats
                                .length > 0 ? (
                                reportsData.eventStats.participation_stats.map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                      <span className="text-sm font-medium">
                                        {item.month}
                                      </span>
                                      <div className="flex items-center space-x-4">
                                        <div className="text-center">
                                          <div className="text-lg font-bold text-blue-600">
                                            {item.total_participants || 0}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Total Participants
                                          </div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-lg font-bold text-green-600">
                                            {(item.avg_per_event || 0).toFixed
                                              ? (
                                                  item.avg_per_event || 0
                                                ).toFixed(1)
                                              : item.avg_per_event || 0}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Avg per Event
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>
                                    No participation data available for this
                                    period
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Reviews */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Monthly Reviews</CardTitle>
                            <CardDescription>
                              Review submission trends
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {reportsData.reviewStats.monthly_reviews &&
                              reportsData.reviewStats.monthly_reviews.length >
                                0 ? (
                                reportsData.reviewStats.monthly_reviews.map(
                                  (item, index) => {
                                    const maxCount = Math.max(
                                      ...reportsData.reviewStats.monthly_reviews.map(
                                        (r) => r.count,
                                      ),
                                      1,
                                    );
                                    return (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between"
                                      >
                                        <span className="text-sm font-medium">
                                          {item.month}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                          <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div
                                              className="bg-yellow-600 h-2 rounded-full"
                                              style={{
                                                width: `${Math.min((item.count / maxCount) * 100, 100)}%`,
                                              }}
                                            ></div>
                                          </div>
                                          <div className="text-right">
                                            <div className="text-sm font-bold">
                                              {item.count}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              ★
                                              {(item.avg_rating || 0).toFixed
                                                ? (
                                                    item.avg_rating || 0
                                                  ).toFixed(1)
                                                : item.avg_rating || 0}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  },
                                )
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>
                                    No review data available for this period
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Rating Distribution */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Rating Distribution</CardTitle>
                            <CardDescription>
                              Breakdown of review ratings
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {reportsData.reviewStats.rating_distribution &&
                              reportsData.reviewStats.rating_distribution
                                .length > 0 ? (
                                reportsData.reviewStats.rating_distribution.map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium">
                                          {item.rating}
                                        </span>
                                        <Star className="w-4 h-4 text-yellow-500" />
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                          <div
                                            className="bg-yellow-500 h-2 rounded-full"
                                            style={{
                                              width: `${item.percentage || 0}%`,
                                            }}
                                          ></div>
                                        </div>
                                        <span className="text-sm font-bold w-12 text-right">
                                          {item.count} ({item.percentage || 0}%)
                                        </span>
                                      </div>
                                    </div>
                                  ),
                                )
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>No rating distribution data available</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Top Rated Events */}
                        <Card className="lg:col-span-2">
                          <CardHeader>
                            <CardTitle>Top Rated Events</CardTitle>
                            <CardDescription>
                              Events with highest average ratings
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {reportsData.reviewStats.top_rated_events &&
                              reportsData.reviewStats.top_rated_events.length >
                                0 ? (
                                reportsData.reviewStats.top_rated_events.map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">
                                          {item.event_title}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {item.review_count} reviews
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                        <span className="font-bold text-sm">
                                          {(item.avg_rating || 0).toFixed
                                            ? (item.avg_rating || 0).toFixed(1)
                                            : item.avg_rating || 0}
                                        </span>
                                      </div>
                                    </div>
                                  ),
                                )
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>No top-rated events data available</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Reports Data
                    </h3>
                    <p className="text-gray-500 text-center mb-4">
                      Unable to load reports data. Please try refreshing or
                      check your connection.
                    </p>
                    <Button onClick={loadReportsData} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}

      {/* User Details Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View detailed information about the user
            </DialogDescription>
          </DialogHeader>

          {userDetailsLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading user details...</span>
            </div>
          ) : selectedUser ? (
            <>
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="space-y-6 pb-6 px-1">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">
                        Name
                      </Label>
                      <p className="text-sm font-medium mt-1">
                        {selectedUser.others?.title
                          ? `${selectedUser.others.title}. `
                          : ""}
                        {selectedUser.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">
                        Email
                      </Label>
                      <p className="text-sm font-medium mt-1">
                        {selectedUser.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">
                        Mobile
                      </Label>
                      <p className="text-sm font-medium mt-1">
                        {selectedUser.mobile}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">
                        Gender
                      </Label>
                      <p className="text-sm font-medium mt-1 capitalize">
                        {selectedUser.others?.gender || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">
                        Date of Birth
                      </Label>
                      <p className="text-sm font-medium mt-1">
                        {selectedUser.others?.dob
                          ? new Date(
                              selectedUser.others.dob,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">
                        Blood Group
                      </Label>
                      <p className="text-sm font-medium mt-1">
                        {selectedUser.others?.bloodGroup || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">
                        Education
                      </Label>
                      <p className="text-sm font-medium mt-1 capitalize">
                        {selectedUser.others?.education?.replace("-", " ") ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">
                        Profession
                      </Label>
                      <p className="text-sm font-medium mt-1">
                        {selectedUser.others?.profession || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">
                        Registration Date
                      </Label>
                      <p className="text-sm font-medium mt-1">
                        {new Date(selectedUser.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Address Information */}
                  {(selectedUser.others?.houseNo ||
                    selectedUser.others?.locality ||
                    selectedUser.others?.city) && (
                    <div className="border-t pt-4">
                      <Label className="text-sm font-semibold text-gray-600 mb-2 block">
                        Address
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">
                            House No.
                          </Label>
                          <p className="text-sm font-medium">
                            {selectedUser.others?.houseNo || "N/A"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">
                            Locality
                          </Label>
                          <p className="text-sm font-medium">
                            {selectedUser.others?.locality || "N/A"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">City</Label>
                          <p className="text-sm font-medium">
                            {selectedUser.others?.city || "N/A"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">
                            Pin Code
                          </Label>
                          <p className="text-sm font-medium">
                            {selectedUser.others?.pinCode || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skills and Health Information */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 gap-4">
                      {selectedUser.skills &&
                        selectedUser.skills.length > 0 && (
                          <div>
                            <Label className="text-sm font-semibold text-gray-600">
                              Skills
                            </Label>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {selectedUser.skills.map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                      {selectedUser.others?.diseases &&
                        selectedUser.others.diseases.length > 0 && (
                          <div>
                            <Label className="text-sm font-semibold text-gray-600">
                              Medical Conditions
                            </Label>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {selectedUser.others.diseases.map(
                                (disease, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs text-red-600 border-red-200"
                                  >
                                    {disease}
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  {(selectedUser.others?.emergencyName ||
                    selectedUser.others?.emergencyContact) && (
                    <div className="border-t pt-4">
                      <Label className="text-sm font-semibold text-gray-600 mb-2 block">
                        Emergency Contact
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Name</Label>
                          <p className="text-sm font-medium">
                            {selectedUser.others?.emergencyName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">
                            Relation
                          </Label>
                          <p className="text-sm font-medium capitalize">
                            {selectedUser.others?.emergencyRelation || "N/A"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs text-gray-500">
                            Contact Number
                          </Label>
                          <p className="text-sm font-medium">
                            {selectedUser.others?.emergencyContact || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Section */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold text-gray-600">
                          Account Status
                        </Label>
                        <div className="mt-1">
                          <Badge
                            variant={
                              selectedUser.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className="text-sm"
                          >
                            {selectedUser.status?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-600">
                          User ID
                        </Label>
                        <p className="text-sm font-medium mt-1">
                          #{selectedUser.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="border-t pt-4">
                    <Label className="text-sm font-semibold text-gray-600">
                      Documents for Verification
                    </Label>
                    {selectedUser.documents &&
                    selectedUser.documents.length > 0 ? (
                      <div className="mt-2 space-y-3">
                        {selectedUser.documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-blue-500" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium capitalize">
                                  {doc.type.replace("-", " ")}
                                  {doc.number && (
                                    <span className="text-gray-500 ml-2">
                                      ({doc.number})
                                    </span>
                                  )}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {doc.file}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDocumentView(
                                    doc.file,
                                    `${doc.type} - ${doc.number}`,
                                  )
                                }
                                className="hover:bg-blue-50 hover:border-blue-300"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement("a");
                                  link.href = doc.file.startsWith("http")
                                    ? doc.file
                                    : `${STORAGE_BASE_URL}/storage/${doc.file}`;
                                  link.download =
                                    doc.file.split("/").pop() || doc.file;
                                  link.target = "_blank";
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="hover:bg-green-50 hover:text-green-600"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 p-4 border rounded-lg bg-gray-50 text-center">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          No documents uploaded by this user
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          User may need to upload verification documents
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Fixed at bottom */}
              <div className="flex-shrink-0 flex justify-end space-x-2 border-t pt-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setUserDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => loadUserDetails(selectedUser.id)}
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">
                    No user data available
                  </p>
                  <p className="text-sm">
                    Please select a user to view their details
                  </p>
                </div>
              </div>

              {/* Action Buttons - Fixed at bottom */}
              <div className="flex-shrink-0 flex justify-end space-x-2 border-t pt-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setUserDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Viewing Dialog */}
      <Dialog open={documentViewOpen} onOpenChange={setDocumentViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span>Document Viewer</span>
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.name || "Document"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {selectedDocument && (
              <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
                {/* Check if it's an image */}
                {selectedDocument.url.match(
                  /\.(jpg|jpeg|png|gif|bmp|webp)$/i,
                ) ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <img
                      src={selectedDocument.url}
                      alt={selectedDocument.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex flex-col items-center justify-center h-full text-gray-500">
                              <FileText class="w-16 h-16 mb-4" />
                              <p class="text-lg font-medium">Unable to load image</p>
                              <p class="text-sm">The document may not be accessible or may be in a different format.</p>
                              <button onclick="window.open('${selectedDocument.url}', '_blank')" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                Open in New Tab
                              </button>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                ) : selectedDocument.url.match(/\.pdf$/i) ? (
                  /* PDF Viewer */
                  <iframe
                    src={selectedDocument.url}
                    className="w-full h-full border-0"
                    title={selectedDocument.name}
                    onError={() => {
                      toast.error(
                        "Failed to load PDF document. Please try opening in a new tab.",
                      );
                    }}
                  />
                ) : (
                  /* Generic document viewer */
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-600">
                    <FileText className="w-16 h-16 mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">
                      Document Preview
                    </h3>
                    <p className="text-sm text-center mb-4 max-w-md">
                      This document type cannot be previewed directly. Click the
                      button below to open it in a new tab.
                    </p>
                    <Button
                      onClick={() =>
                        window.open(selectedDocument.url, "_blank")
                      }
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FileText className="w-4 h-4" />
              <span>{selectedDocument?.name}</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedDocument) {
                    const link = document.createElement("a");
                    link.href = selectedDocument.url;
                    link.download = selectedDocument.name;
                    link.target = "_blank";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  selectedDocument &&
                  window.open(selectedDocument.url, "_blank")
                }
              >
                <Eye className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                variant="outline"
                onClick={() => setDocumentViewOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? "Update category information"
                : "Add a new skill category"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                placeholder="Enter category name"
              />
            </div>
            <div>
              <Label htmlFor="maxGuests">Max Guests</Label>
              <Input
                id="maxGuests"
                type="number"
                value={categoryForm.max_guests}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    max_guests: parseInt(e.target.value) || 4,
                  })
                }
                placeholder="Maximum guests allowed"
              />
            </div>
            <div>
              <Label htmlFor="categoryStatus">Status</Label>
              <Select
                value={categoryForm.status}
                onValueChange={(value) =>
                  setCategoryForm({ ...categoryForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setCategoryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={
                  selectedCategory ? handleUpdateCategory : handleCreateCategory
                }
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {selectedCategory ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Option Dialog */}
      <Dialog
        open={formOptionDialogOpen}
        onOpenChange={setFormOptionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedFormOption ? "Edit Form Option" : "Create Form Option"}
            </DialogTitle>
            <DialogDescription>
              {selectedFormOption
                ? "Update form option information"
                : "Add a new form option"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="optionType">Type</Label>
              <Select
                value={formOptionForm.type}
                onValueChange={(value) =>
                  setFormOptionForm({ ...formOptionForm, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="skills">Skills/Topics</SelectItem>
                  <SelectItem value="diseases">Diseases</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="optionName">Name</Label>
              <Input
                id="optionName"
                value={formOptionForm.name}
                onChange={(e) =>
                  setFormOptionForm({ ...formOptionForm, name: e.target.value })
                }
                placeholder="Enter option name"
              />
            </div>
            <div>
              <Label htmlFor="optionValue">Value (optional)</Label>
              <Input
                id="optionValue"
                value={formOptionForm.value}
                onChange={(e) =>
                  setFormOptionForm({
                    ...formOptionForm,
                    value: e.target.value,
                  })
                }
                placeholder="Auto-generated if empty"
              />
            </div>
            <div>
              <Label htmlFor="optionDescription">Description (optional)</Label>
              <Textarea
                id="optionDescription"
                value={formOptionForm.description}
                onChange={(e) =>
                  setFormOptionForm({
                    ...formOptionForm,
                    description: e.target.value,
                  })
                }
                placeholder="Enter description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formOptionForm.sort_order}
                onChange={(e) =>
                  setFormOptionForm({
                    ...formOptionForm,
                    sort_order: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Sort order"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formOptionForm.is_active}
                onChange={(e) =>
                  setFormOptionForm({
                    ...formOptionForm,
                    is_active: e.target.checked,
                  })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setFormOptionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={
                  selectedFormOption
                    ? handleUpdateFormOption
                    : handleCreateFormOption
                }
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {selectedFormOption ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Setting Dialog */}
      <Dialog open={settingDialogOpen} onOpenChange={setSettingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSetting ? "Edit Setting" : "Create Setting"}
            </DialogTitle>
            <DialogDescription>
              {selectedSetting
                ? "Update setting information"
                : "Add a new application setting"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="settingKey">Key</Label>
              <Input
                id="settingKey"
                value={settingForm.key}
                onChange={(e) =>
                  setSettingForm({ ...settingForm, key: e.target.value })
                }
                placeholder="Enter setting key"
              />
            </div>
            <div>
              <Label htmlFor="settingValue">Value</Label>
              <Textarea
                id="settingValue"
                value={settingForm.value}
                onChange={(e) =>
                  setSettingForm({ ...settingForm, value: e.target.value })
                }
                placeholder="Enter setting value"
              />
            </div>
            <div>
              <Label htmlFor="settingType">Type</Label>
              <Select
                value={settingForm.type}
                onValueChange={(value) =>
                  setSettingForm({ ...settingForm, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSettingDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={
                  selectedSetting ? handleUpdateSetting : handleCreateSetting
                }
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {selectedSetting ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Page Dialog */}
      <Dialog open={pageDialogOpen} onOpenChange={setPageDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPage ? "Edit Page Content" : "Create New Page"}
            </DialogTitle>
            <DialogDescription>
              {selectedPage
                ? "Update page title and content"
                : "Create a new page for terms and conditions"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pageTitle">Title</Label>
              <Input
                id="pageTitle"
                value={pageForm.title}
                onChange={(e) =>
                  setPageForm({ ...pageForm, title: e.target.value })
                }
                placeholder="Enter page title"
              />
            </div>
            <div>
              <Label htmlFor="pageContent">Content</Label>
              <Textarea
                id="pageContent"
                value={pageForm.content}
                onChange={(e) =>
                  setPageForm({ ...pageForm, content: e.target.value })
                }
                placeholder="Enter page content"
                rows={10}
              />
            </div>
            <div>
              <Label htmlFor="pageStatus">Status</Label>
              <Select
                value={pageForm.status}
                onValueChange={(value) =>
                  setPageForm({ ...pageForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setPageDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={selectedPage ? handleUpdatePage : handleCreatePage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {selectedPage ? "Update Page" : "Create Page"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Reply Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Contact</DialogTitle>
            <DialogDescription>
              Send a reply to the user inquiry
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Original Message:</h4>
                <p className="text-sm text-gray-700">
                  {selectedContact.message}
                </p>
              </div>
              <div>
                <Label htmlFor="replySubject">Subject</Label>
                <Input
                  id="replySubject"
                  value={replyForm.subject}
                  onChange={(e) =>
                    setReplyForm({ ...replyForm, subject: e.target.value })
                  }
                  placeholder="Enter reply subject"
                />
              </div>
              <div>
                <Label htmlFor="replyMessage">Message</Label>
                <Textarea
                  id="replyMessage"
                  value={replyForm.message}
                  onChange={(e) =>
                    setReplyForm({ ...replyForm, message: e.target.value })
                  }
                  placeholder="Enter your reply"
                  rows={6}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setContactDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleReplyToContact} disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? "Edit Event" : "Create New Event"}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent
                ? "Update event details"
                : "Create a new charity event or volunteer activity"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={eventForm.title}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, title: e.target.value })
                  }
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, description: e.target.value })
                  }
                  placeholder="Describe the event"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={
                    eventForm.category_id > 0
                      ? eventForm.category_id.toString()
                      : ""
                  }
                  onValueChange={(value) =>
                    setEventForm({
                      ...eventForm,
                      category_id: parseInt(value) || 0,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="event_type">Event Type *</Label>
                <Select
                  value={eventForm.event_type}
                  onValueChange={(value) =>
                    setEventForm({ ...eventForm, event_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="charity">Charity</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="fundraising">Fundraising</SelectItem>
                    <SelectItem value="awareness">Awareness</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={eventForm.location}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, location: e.target.value })
                  }
                  placeholder="Event location"
                />
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={eventForm.image_url}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, image_url: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="event_date">Event Date *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={eventForm.event_date}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, event_date: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={eventForm.start_time}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, start_time: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={eventForm.end_time}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, end_time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="max_participants">Max Participants *</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  value={eventForm.max_participants}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      max_participants: parseInt(e.target.value) || 50,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="organizer">Organizer *</Label>
                <Select
                  value={
                    eventForm.organizer_id > 0
                      ? eventForm.organizer_id.toString()
                      : ""
                  }
                  onValueChange={(value) =>
                    setEventForm({
                      ...eventForm,
                      organizer_id: parseInt(value) || 0,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organizer" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(admins) &&
                      admins.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id.toString()}>
                          {admin.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={eventForm.status}
                  onValueChange={(value) =>
                    setEventForm({ ...eventForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="registration_deadline">
                  Registration Deadline
                </Label>
                <Input
                  id="registration_deadline"
                  type="datetime-local"
                  value={eventForm.registration_deadline}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      registration_deadline: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={eventForm.is_featured}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      is_featured: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="is_featured">Featured Event</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div>
              <Label htmlFor="contact_info">Contact Information</Label>
              <Textarea
                id="contact_info"
                value={eventForm.contact_info}
                onChange={(e) =>
                  setEventForm({ ...eventForm, contact_info: e.target.value })
                }
                placeholder="Contact details for participants"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setEventDialogOpen(false);
                setSelectedEvent(null);
                resetEventForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={selectedEvent ? handleUpdateEvent : handleCreateEvent}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              {selectedEvent ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mass Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Mass Message</DialogTitle>
            <DialogDescription>
              Send a message to all users via notification or email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Message Type</Label>
              <Select
                value={massMessageForm.type}
                onValueChange={(value) =>
                  setMassMessageForm({ ...massMessageForm, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notification">
                    Push Notification
                  </SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {massMessageForm.type === "notification" ? (
              <>
                <div>
                  <Label htmlFor="notificationTitle">Title</Label>
                  <Input
                    id="notificationTitle"
                    value={massMessageForm.title}
                    onChange={(e) =>
                      setMassMessageForm({
                        ...massMessageForm,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter notification title"
                  />
                </div>
                <div>
                  <Label htmlFor="notificationMessage">Message</Label>
                  <Textarea
                    id="notificationMessage"
                    value={massMessageForm.message}
                    onChange={(e) =>
                      setMassMessageForm({
                        ...massMessageForm,
                        message: e.target.value,
                      })
                    }
                    placeholder="Enter notification message"
                    rows={4}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="emailSubject">Subject</Label>
                  <Input
                    id="emailSubject"
                    value={massMessageForm.subject}
                    onChange={(e) =>
                      setMassMessageForm({
                        ...massMessageForm,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Enter email subject"
                  />
                </div>
                <div>
                  <Label htmlFor="emailMessage">Message</Label>
                  <Textarea
                    id="emailMessage"
                    value={massMessageForm.message}
                    onChange={(e) =>
                      setMassMessageForm({
                        ...massMessageForm,
                        message: e.target.value,
                      })
                    }
                    placeholder="Enter email message"
                    rows={6}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setMessageDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSendMassMessage} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Admin Dialog */}
      <Dialog
        open={createAdminDialogOpen}
        onOpenChange={setCreateAdminDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
            <DialogDescription>
              Add a new administrator account with elevated permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="adminName">Full Name</Label>
              <Input
                id="adminName"
                value={adminForm.name}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, name: e.target.value })
                }
                placeholder="Enter admin's full name"
              />
            </div>
            <div>
              <Label htmlFor="adminEmail">Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={adminForm.email}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, email: e.target.value })
                }
                placeholder="Enter admin's email"
              />
            </div>
            <div>
              <Label htmlFor="adminMobile">Mobile Number</Label>
              <Input
                id="adminMobile"
                value={adminForm.mobile}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, mobile: e.target.value })
                }
                placeholder="Enter admin's mobile number"
              />
            </div>
            <div>
              <Label htmlFor="adminPassword">Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminForm.password}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, password: e.target.value })
                }
                placeholder="Enter admin's password"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setCreateAdminDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateAdmin} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Admin"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
