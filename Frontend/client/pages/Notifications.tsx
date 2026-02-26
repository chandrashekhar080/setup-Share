import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bell,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  UserPlus,
  MessageCircle,
  Gift,
  Star,
  X,
  MarkAsUnreadIcon,
} from "lucide-react";

interface NotificationProps {
  onClose?: () => void;
}

export default function Notifications({ onClose }: NotificationProps) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "event_request",
      title: "New Event Request",
      message: "3 people want to join your 'Morning Yoga Session'",
      time: "2 hours ago",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      unread: true,
      actionable: true,
    },
    {
      id: 2,
      type: "event_reminder",
      title: "Event Reminder",
      message: "Your 'Cooking Workshop' starts in 30 minutes",
      time: "30 minutes ago",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      unread: true,
      actionable: false,
    },
    {
      id: 3,
      type: "event_confirmation",
      title: "Event Confirmed",
      message: "Your participation in 'Garden Workshop' has been confirmed",
      time: "1 day ago",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      unread: false,
      actionable: false,
    },
    {
      id: 4,
      type: "event_completed",
      title: "Event Completed",
      message:
        "Thank you for hosting 'Book Reading Club'. Please rate your guests.",
      time: "2 days ago",
      icon: Star,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      unread: false,
      actionable: true,
    },
    {
      id: 5,
      type: "message",
      title: "New Message",
      message: "Mr. Ashok Verma sent you a thank you message",
      time: "3 days ago",
      icon: MessageCircle,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      unread: false,
      actionable: false,
    },
    {
      id: 6,
      type: "achievement",
      title: "Achievement Unlocked",
      message: "You've successfully hosted 5 events! Keep up the great work.",
      time: "1 week ago",
      icon: Gift,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      unread: false,
      actionable: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, unread: false })),
    );
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleAction = (notification: any) => {
    switch (notification.type) {
      case "event_request":
        alert("Opening event requests management...");
        break;
      case "event_confirmation":
        alert("Event details updated...");
        break;
      case "event_completed":
        alert("Opening rating form...");
        break;
      default:
        markAsRead(notification.id);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Notifications</DialogTitle>
              <DialogDescription>
                Your latest updates and activities
              </DialogDescription>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No notifications
              </h3>
              <p className="text-gray-500">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md ${
                  notification.unread
                    ? "border-blue-200 shadow-sm"
                    : "border-gray-200"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.bgColor}`}
                    >
                      <notification.icon
                        className={`w-5 h-5 ${notification.color}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {notification.time}
                            </span>
                            <div className="flex items-center space-x-2">
                              {notification.actionable && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(notification)}
                                  className="text-xs"
                                >
                                  {notification.type === "event_request" &&
                                    "View Requests"}
                                  {notification.type === "event_confirmation" &&
                                    "View Event"}
                                  {notification.type === "event_completed" &&
                                    "Rate Event"}
                                </Button>
                              )}
                              {notification.unread && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs p-1 h-auto"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  removeNotification(notification.id)
                                }
                                className="text-xs p-1 h-auto text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{notifications.length} total notifications</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotifications([])}
                className="text-xs"
              >
                Clear all
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
