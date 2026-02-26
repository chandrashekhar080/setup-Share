import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Users,
  Calendar,
  Plus,
  Bell,
  Settings,
  Home,
  User,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  useDashboardStats, 
  useRecentActivity, 
  useTodaySchedule, 
  useCareCircle, 
  useQuickActions 
} from "@/hooks/useDashboard";
import { useState } from "react";

export default function Dashboard() {
  // API hooks
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { activities, loading: activitiesLoading, error: activitiesError } = useRecentActivity();
  const { schedule, loading: scheduleLoading, error: scheduleError, addVisit } = useTodaySchedule();
  const { members, loading: membersLoading, error: membersError } = useCareCircle();
  const { addCareNote, sendUpdate, loading: actionsLoading } = useQuickActions();

  // Local state for UI interactions
  const [isAddingVisit, setIsAddingVisit] = useState(false);

  // Handle quick actions
  const handleAddVisit = async () => {
    setIsAddingVisit(true);
    // This would typically open a modal or form
    // For now, we'll just simulate adding a visit
    const result = await addVisit({
      title: "New Visit",
      date: new Date().toISOString().split('T')[0],
      time: "10:00 AM",
      assignee_id: 1,
      type: "visit",
      duration: 60,
      notes: "Scheduled from dashboard"
    });
    
    if (result.success) {
      console.log("Visit added successfully");
    } else {
      console.error("Failed to add visit:", result.error);
    }
    setIsAddingVisit(false);
  };

  const handleAddCareNote = async () => {
    const result = await addCareNote({
      title: "Quick Note",
      content: "Added from dashboard quick action",
      category: "general",
      priority: "medium"
    });
    
    if (result.success) {
      console.log("Care note added successfully");
    } else {
      console.error("Failed to add care note:", result.error);
    }
  };

  const handleSendUpdate = async () => {
    const result = await sendUpdate({
      message: "Quick update from dashboard",
      priority: "medium"
    });
    
    if (result.success) {
      console.log("Update sent successfully");
    } else {
      console.error("Failed to send update:", result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CareShare
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, Sarah
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your care circle today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Care Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : statsError ? (
                <div className="text-sm text-red-500">Error loading data</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.active_care_members || 0}</div>
                  <div className="flex items-center mt-2">
                    <Users className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{stats?.new_members_this_week || 0} this week</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Upcoming Visits
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : statsError ? (
                <div className="text-sm text-red-500">Error loading data</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.upcoming_visits || 0}</div>
                  <div className="flex items-center mt-2">
                    <Calendar className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600">Next 7 days</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Care Hours This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : statsError ? (
                <div className="text-sm text-red-500">Error loading data</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.care_hours_this_month || 0}</div>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-green-600">
                      +{stats?.care_hours_growth || 0}% from last month
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : statsError ? (
                <div className="text-sm text-red-500">Error loading data</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.emergency_contacts || 0}</div>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-600">Available 24/7</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates from your care circle
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">Loading activities...</span>
                  </div>
                ) : activitiesError ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-red-500">Failed to load recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' : 
                          activity.status === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span>{" "}
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Schedule */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Today's Schedule</CardTitle>
                    <CardDescription>
                      Planned visits and appointments
                    </CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleAddVisit}
                    disabled={isAddingVisit}
                  >
                    {isAddingVisit ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Add Visit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {scheduleLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">Loading schedule...</span>
                  </div>
                ) : scheduleError ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-red-500">Failed to load today's schedule</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schedule.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4 p-3 rounded-lg border"
                      >
                        <div className="text-sm font-medium text-gray-600 w-20">
                          {item.time}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.assignee}</p>
                        </div>
                        <Badge
                          variant={
                            item.type === "visit" ? "default" : 
                            item.type === "appointment" ? "secondary" : "outline"
                          }
                        >
                          {item.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Care Circle */}
            <Card>
              <CardHeader>
                <CardTitle>Care Circle</CardTitle>
                <CardDescription>
                  Active family members and caregivers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">Loading care circle...</span>
                  </div>
                ) : membersError ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-red-500">Failed to load care circle</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            member.status === "online"
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleAddVisit}
                    disabled={isAddingVisit || actionsLoading}
                  >
                    {isAddingVisit ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Calendar className="w-4 h-4 mr-2" />
                    )}
                    Schedule Visit
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    disabled={actionsLoading}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Invite Family Member
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleAddCareNote}
                    disabled={actionsLoading}
                  >
                    {actionsLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Add Care Note
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleSendUpdate}
                    disabled={actionsLoading}
                  >
                    {actionsLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Bell className="w-4 h-4 mr-2" />
                    )}
                    Send Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
