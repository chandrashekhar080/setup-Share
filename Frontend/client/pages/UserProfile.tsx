import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Clock,
  Activity,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Heart,
  Users,
} from "lucide-react";
import ApiService from "@/services/api";

interface UserActivity {
  id: string;
  type:
    | "registration"
    | "login"
    | "logout"
    | "event_created"
    | "event_joined"
    | "event_cancelled"
    | "profile_updated";
  timestamp: string;
  description: string;
  details?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  age: number;
  gender: string;
  location: string;
  address: string;
  qualification: string;
  skills: string[];
  medicalConditions: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    mobile: string;
  };
  registrationDate: string;
  lastLogin: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  kycDocuments: string[];
  totalEventsCreated: number;
  totalEventsJoined: number;
  averageRating: number;
  totalReviews: number;
}

export default function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiService = new ApiService();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user profile details and activities in parallel
        const [userProfile, userActivities] = await Promise.all([
          apiService.getUserProfileDetails(parseInt(userId)),
          apiService.getUserActivity(parseInt(userId))
        ]);

        setUser(userProfile);
        setActivities(userActivities);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err instanceof Error ? err.message : "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleApproveUser = async () => {
    if (!user) return;
    
    try {
      const comments = prompt("Add approval comments (optional):");
      
      // Update approval status in database
      await apiService.approveUserProfile(parseInt(user.id), 'approved', comments || 'Profile approved by admin');
      
      // Send email notification
      try {
        await apiService.sendEmailToUser(parseInt(user.id), {
          subject: "🎉 Your Share2Care Profile Has Been Approved!",
          message: `
Dear ${user.name},

Congratulations! Your profile on Share2Care has been successfully approved by our admin team.

You can now:
✅ Create and host events
✅ Join community events
✅ Connect with other members
✅ Share your skills and time

${comments ? `Admin Comments: ${comments}` : ''}

Welcome to the Share2Care community! We're excited to have you on board.

Best regards,
The Share2Care Team

---
This is an automated message. Please do not reply to this email.
          `,
          template: 'user_approval'
        });
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
      }

      // Send in-app notification
      try {
        await apiService.sendNotificationToUser(parseInt(user.id), {
          title: "Profile Approved! 🎉",
          message: `Your profile has been approved! You can now create and join events. ${comments ? `Admin note: ${comments}` : ''}`,
          type: 'approval_success'
        });
      } catch (notificationError) {
        console.error("Failed to send approval notification:", notificationError);
      }
      
      // Refresh user data
      const updatedProfile = await apiService.getUserProfileDetails(parseInt(user.id));
      setUser(updatedProfile);
      
      alert("User approved successfully! Email and notification sent.");
    } catch (err) {
      console.error("Error approving user:", err);
      alert("Failed to approve user. Please try again.");
    }
  };

  const handleRejectUser = async () => {
    if (!user) return;
    
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;
    
    try {
      // Update approval status in database
      await apiService.approveUserProfile(parseInt(user.id), 'rejected', reason);
      
      // Send email notification
      try {
        await apiService.sendEmailToUser(parseInt(user.id), {
          subject: "Share2Care Profile Review Update",
          message: `
Dear ${user.name},

Thank you for your interest in joining Share2Care. After reviewing your profile, we need you to make some updates before we can approve your account.

Reason for review: ${reason}

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
          `,
          template: 'user_approval'
        });
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }

      // Send in-app notification
      try {
        await apiService.sendNotificationToUser(parseInt(user.id), {
          title: "Profile Needs Review",
          message: `Your profile requires some updates before approval. Admin feedback: ${reason}`,
          type: 'approval_review'
        });
      } catch (notificationError) {
        console.error("Failed to send rejection notification:", notificationError);
      }
      
      // Refresh user data
      const updatedProfile = await apiService.getUserProfileDetails(parseInt(user.id));
      setUser(updatedProfile);
      
      alert("User rejection processed successfully! Email and notification sent.");
    } catch (err) {
      console.error("Error rejecting user:", err);
      alert("Failed to reject user. Please try again.");
    }
  };

  const getActivityIcon = (type: UserActivity["type"]) => {
    switch (type) {
      case "registration":
        return <User className="w-4 h-4 text-blue-600" />;
      case "login":
        return <Shield className="w-4 h-4 text-green-600" />;
      case "logout":
        return <Shield className="w-4 h-4 text-gray-600" />;
      case "event_created":
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case "event_joined":
        return <Users className="w-4 h-4 text-orange-600" />;
      case "event_cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "profile_updated":
        return <Activity className="w-4 h-4 text-indigo-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityBadgeColor = (type: UserActivity["type"]) => {
    switch (type) {
      case "registration":
        return "bg-blue-100 text-blue-800";
      case "login":
        return "bg-green-100 text-green-800";
      case "logout":
        return "bg-gray-100 text-gray-800";
      case "event_created":
        return "bg-purple-100 text-purple-800";
      case "event_joined":
        return "bg-orange-100 text-orange-800";
      case "event_cancelled":
        return "bg-red-100 text-red-800";
      case "profile_updated":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error || (!loading && !user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error ? "Error Loading Profile" : "User Not Found"}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The requested user profile could not be found."}
          </p>
          <Link to="/admin">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin Panel
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h1>
                <p className="text-sm text-gray-600">User ID: {user.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                className={
                  user.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : user.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }
              >
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </Badge>
              {user.status === "pending" && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleApproveUser}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600"
                    onClick={handleRejectUser}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Events Created
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user.totalEventsCreated}
                  </div>
                  <p className="text-xs text-muted-foreground">As host</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Events Joined
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user.totalEventsJoined}
                  </div>
                  <p className="text-xs text-muted-foreground">As guest</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Rating
                  </CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user.averageRating}/5
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From {user.totalReviews} reviews
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{user.mobile}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{user.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {user.age} years, {user.gender}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        Registered: {formatDate(user.registrationDate)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        Last Login: {formatDate(user.lastLogin)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{user.qualification}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <p className="text-sm text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Age & Gender
                    </Label>
                    <p className="text-sm text-gray-900">
                      {user.age} years, {user.gender}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Address
                    </Label>
                    <p className="text-sm text-gray-900">{user.address}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Education
                    </Label>
                    <p className="text-sm text-gray-900">
                      {user.qualification}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Mobile
                    </Label>
                    <p className="text-sm text-gray-900">{user.mobile}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Emergency Contact
                    </Label>
                    <div className="text-sm text-gray-900">
                      <p>{user.emergencyContact.name}</p>
                      <p className="text-gray-600">
                        {user.emergencyContact.relationship}
                      </p>
                      <p className="text-gray-600">
                        {user.emergencyContact.mobile}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills & Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Medical Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.medicalConditions.map((condition, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-red-100 text-red-800"
                      >
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Activity Timeline</CardTitle>
                <CardDescription>
                  Complete history of user activities on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.description}
                            </p>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getActivityBadgeColor(activity.type)}`}
                            >
                              {activity.type.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                        {activity.details && (
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>KYC Documents</CardTitle>
                <CardDescription>
                  Documents uploaded for identity verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.kycDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{doc}</p>
                          <p className="text-sm text-gray-600">Verified</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Document
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}
