import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Swal from "sweetalert2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Plus,
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  Filter,
  Search,
  UserCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  ListFilter,
  Loader2,
} from "lucide-react";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { BsMicrosoft } from "react-icons/bs";
import apiService from "@/services/api";

// Utility function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `http://localhost:8000/storage/${imagePath}`;
};

// Utility function to get unique active categories
const getUniqueActiveCategories = (categories) => {
  return categories
    .filter((cat) => cat.status === "active" || cat.status === 1)
    .filter(
      (category, index, self) =>
        index === self.findIndex((c) => c.name === category.name),
    );
};

// Utility functions for date and time formatting
const formatDate = (dateString) => {
  if (!dateString) return "Date TBD";
  try {
    let date;
    if (dateString.includes("T")) {
      // For full datetime strings with timezone
      date = new Date(dateString);
      // Convert to India timezone and extract date
      return date.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } else {
      // For date-only strings (YYYY-MM-DD)
      const [year, month, day] = dateString.split("-");
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

const formatTime = (timeString) => {
  if (!timeString) return "Time TBD";
  try {
    let date;
    if (timeString.includes("T")) {
      // For full datetime strings with timezone (like 2025-08-01T18:30:00.000000Z)
      date = new Date(timeString);
      // Convert to India timezone
      return date.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      // For time-only strings (HH:MM or HH:MM:SS) - assume local time
      const timePart = timeString.includes(":")
        ? timeString
        : `${timeString}:00`;
      date = new Date(`2000-01-01T${timePart}`);
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Invalid Time";
  }
};

// Utility function to determine if an event has ended
const hasEventEnded = (event) => {
  try {
    const now = new Date();

    // If event has end_time, use it to determine if event has ended
    if (event.end_time && event.end_time.trim() !== "") {
      // Handle time-only values by combining with event_date
      const isTimeOnly = !event.end_time.includes("T") && event.end_time.includes(":");
      let eventEndDateTime;
      if (isTimeOnly) {
        const datePart = (event.event_date?.split("T")[0]) || event.event_date;
        eventEndDateTime = new Date(`${datePart}T${event.end_time}`);
      } else {
        eventEndDateTime = new Date(event.end_time);
      }
      return eventEndDateTime < now;
    } else {
      // Fallback: if no end_time, use event_date and assume event ends at end of day
      const eventDate = new Date(event.event_date);
      const eventEndOfDay = new Date(eventDate);
      eventEndOfDay.setHours(23, 59, 59, 999);
      return eventEndOfDay < now;
    }
  } catch (error) {
    console.error("Error checking if event has ended:", error, event);
    // Fallback to original logic
    const eventDate = new Date(event.event_date);
    return eventDate < new Date();
  }
};

// Utility function to determine if an event has started (for join validation)
const hasEventStarted = (event) => {
  try {
    const now = new Date();

    // Use start_time if available, otherwise use event_date
    if (event.start_time && event.start_time.trim() !== "") {
      const eventStartDateTime = new Date(event.start_time);
      return eventStartDateTime < now;
    } else {
      // Fallback: use event_date
      const eventDate = new Date(event.event_date);
      return eventDate < now;
    }
  } catch (error) {
    console.error("Error checking if event has started:", error, event);
    // Fallback to original logic
    const eventDate = new Date(event.event_date);
    return eventDate < new Date();
  }
};

export default function Events() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("current");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedCategory, setSelectedCategory] = useState("all-categories");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [view, setView] = useState("list");

  //added
  const [currentEvents, setCurrentEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [joiningEventId, setJoiningEventId] = useState(null);
  const [userApprovalStatus, setUserApprovalStatus] = useState(null);
  const [isUserApproved, setIsUserApproved] = useState(false);

  // Review functionality states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingEvent, setReviewingEvent] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [eventReviewStatus, setEventReviewStatus] = useState({});
  const [eventReviews, setEventReviews] = useState({});
  const [loadingReviews, setLoadingReviews] = useState({});
  const [userLocationData, setUserLocationData] = useState("");
  const [categoryCount, setCategoryCount] = useState(0);

  function useInterval(callback, delay) {
    const saved = useRef();
    useEffect(() => {
      saved.current = callback;
    }, [callback]);
    useEffect(() => {
      if (delay != null) {
        const id = setInterval(() => saved.current(), delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  // Check if user is logged in and load data
  useEffect(() => {
    // Consider multiple auth indicators (token, email, or mobile)
    const token = localStorage.getItem("userToken");
    const userLoggedInFlag = localStorage.getItem("userLoggedIn") === "true";
    const userEmail = localStorage.getItem("userEmail");
    const userMobile = localStorage.getItem("userMobile");

    // Logged in if we have a token OR (login flag with either email or mobile present)
    const newLoginStatus = !!(
      token ||
      ((userEmail || userMobile) && userLoggedInFlag)
    );
    setIsUserLoggedIn(newLoginStatus);

    // Load user location data if logged in
    if (newLoginStatus) {
      loadUserLocationData();
    }

    // Load categories for the form
    loadCategories();

    // Load events data
    loadEventsData();
  }, []);

  // Reload events when login status changes
  useEffect(() => {
    if (isUserLoggedIn) {
      loadEventsData();
      checkUserApprovalStatus();

      // Request notification permission for event updates
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted for event updates");
          }
        });
      }
    } else {
      setUserApprovalStatus(null);
      setIsUserApproved(false);
    }
  }, [isUserLoggedIn]);

  // Load events data from API
  const loadEventsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all approved events
      const allEvents = await apiService.getAllEvents();

      // Filter events by status and date
      const approved = allEvents.filter(
        (event) => event.status === "active" || event.status === "approved",
      );

      const current = approved.filter((event) => !hasEventEnded(event));
      const past = approved.filter((event) => hasEventEnded(event));

      setCurrentEvents(current);
      setPastEvents(past);

      // Check review status for past events if user is logged in
      if (isUserLoggedIn && past.length > 0) {
        checkEventReviewStatus(past);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh events data (can be called from outside)
  const refreshEvents = () => {
    loadEventsData();
  };

  // Make refresh function available globally for when events are approved
  useEffect(() => {
    window.refreshEventsData = refreshEvents;

    // Function to handle event approval from admin panel
    window.handleEventApproval = (eventData) => {
      // Refresh events data
      loadEventsData();

      // Show notification if it's the current user's event
      const userData = localStorage.getItem("user");
      if (userData && eventData.userId) {
        const user = JSON.parse(userData);
        if (user.id === eventData.userId) {
          // Show success notification
          setTimeout(() => {
            // Try browser notification first, fallback to alert
            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("Event Approved! 🎉", {
                body: `Your event "${eventData.eventTitle}" has been approved and is now live!`,
                icon: "/favicon.ico",
              });
            } else {
              Swal.fire({
                icon: "success",
                title: "Event Approved! 🎉",
                html: `Great news! Your event <strong>"${eventData.eventTitle}"</strong> has been approved and is now live!`,
                confirmButtonText: "Awesome!",
                confirmButtonColor: "#700e12",
              });
            }
          }, 1000);
        }
      }
    };

    return () => {
      delete window.refreshEventsData;
      delete window.handleEventApproval;
    };
  }, []);

  // Listen for event approval notifications
  useEffect(() => {
    const handleEventApproval = (event) => {
      if (event.detail && event.detail.type === "event_approved") {
        // Refresh events data when an event is approved
        loadEventsData();

        // Show notification to user
        if (event.detail.userId) {
          const userData = localStorage.getItem("user");
          if (userData) {
            const user = JSON.parse(userData);
            if (user.id === event.detail.userId) {
              // This is the user's event that got approved
              Swal.fire({
                icon: "success",
                title: "Event Approved! 🎉",
                html: `Great news! Your event <strong>"${event.detail.eventTitle}"</strong> has been approved and is now live!`,
                confirmButtonText: "Awesome!",
                confirmButtonColor: "#700e12",
              });
            }
          }
        }
      }
    };

    // Listen for custom event approval events
    window.addEventListener("eventApproved", handleEventApproval);

    return () => {
      window.removeEventListener("eventApproved", handleEventApproval);
    };
  }, []);

  // Periodic refresh for events (every 30 seconds when user is logged in)
  useInterval(() => {
    if (isUserLoggedIn && !loading) {
      loadEventsData();
    }
  }, 30000);
  function formatCount(num: number): string {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "b";
    if (num >= 10_000_00) return (num / 1_00_000).toFixed(1) + "l"; // lakh
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "m";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
    return num.toString();
  }
  // Load categories from API
  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getAllCategories();
      setCategories(categoriesData);
      const rawCount = categoriesData.length;
      setCategoryCount(formatCount(rawCount));

      console.log(categoriesData);
    } catch (error) {
      console.error("Failed to load categories:", error);
      // Fallback to hardcoded categories if API fails
    }
  };

  // Load user location data from localStorage
  const loadUserLocationData = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);

        // Check if user has location data in 'others' field
        if (user.others) {
          let locationData = "";
          let userDetails;

          try {
            userDetails =
              typeof user.others === "string"
                ? JSON.parse(user.others)
                : user.others;
          } catch (error) {
            console.error("Error parsing user details:", error);
            return;
          }

          // Build location string from user's address data
          const addressParts = [];
          if (userDetails.houseNo && userDetails.houseNo.trim()) {
            addressParts.push(userDetails.houseNo.trim());
          }
          if (userDetails.locality && userDetails.locality.trim()) {
            addressParts.push(userDetails.locality.trim());
          }
          if (userDetails.city && userDetails.city.trim()) {
            addressParts.push(userDetails.city.trim());
          }
          if (userDetails.pinCode && userDetails.pinCode.trim()) {
            addressParts.push(userDetails.pinCode.trim());
          }

          locationData = addressParts.join(", ");

          if (locationData) {
            setUserLocationData(locationData);
            setLocation(locationData); // Auto-fill the location field
          }
        }
      }
    } catch (error) {
      console.error("Failed to load user location data:", error);
    }
  };

  // Check user approval status
  const checkUserApprovalStatus = async () => {
    if (!isUserLoggedIn) {
      setUserApprovalStatus(null);
      setIsUserApproved(false);
      return;
    }

    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        setUserApprovalStatus(null);
        setIsUserApproved(false);
        return;
      }

      const user = JSON.parse(userData);
      const response = await apiService.getUserApprovalStatus(user.id);

      if (response.success) {
        const { status, approval_status } = response.data;
        setUserApprovalStatus(
          approval_status || (status === 1 ? "approved" : "pending"),
        );
        setIsUserApproved(approval_status === "approved" || status === 1);
      } else {
        setUserApprovalStatus("pending");
        setIsUserApproved(false);
      }
    } catch (error) {
      console.error("Failed to check user approval status:", error);
      setUserApprovalStatus("pending");
      setIsUserApproved(false);
    }
  };

  // Check if user can review events
  const checkEventReviewStatus = async (events) => {
    if (!isUserLoggedIn || !events.length) return;

    try {
      const userData = localStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);
      const reviewStatusMap = {};

      // Helper to pause between requests to avoid 429 rate limits
      const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

      // Check review status for each past event
      for (const event of events) {

        try {
          const response = await apiService.canUserReviewEvent(
            event.id,
            user.id,
          );
          if (response.success) {
            const d = response.data || {};
            // Normalize various possible backend key names to the expected shape
            reviewStatusMap[event.id] = {
              can_review:
                d.can_review ?? d.canReview ?? d.allowed ?? d.is_allowed ?? false,
              has_reviewed:
                d.has_reviewed ?? d.hasReviewed ?? d.reviewed ?? d.is_reviewed ?? false,
              existing_rating: d.existing_rating ?? d.rating ?? null,
              existing_review: d.existing_review ?? d.review ?? null,
            };
          } else {
            // Ensure we at least set a default entry to avoid undefined checks later
            reviewStatusMap[event.id] = {
              can_review: false,
              has_reviewed: false,
              existing_rating: null,
              existing_review: null,
            };
          }
        } catch (error) {
          console.error(
            `Failed to check review status for event ${event.id}:`,
            error,
          );
          // On Too Many Attempts (429) or any error, set safe defaults and continue
          reviewStatusMap[event.id] = {
            can_review: false,
            has_reviewed: false,
            existing_rating: null,
            existing_review: null,
          };
        }

        // Small delay between calls to reduce chance of 429s from backend
        await sleep(200);
      }

      setEventReviewStatus(reviewStatusMap);
    } catch (error) {
      console.error("Failed to check event review status:", error);
    }
  };

  // Fetch reviews for an event
  const fetchEventReviews = async (eventId) => {
    if (eventReviews[eventId] || loadingReviews[eventId]) return; // Already loaded or loading

    setLoadingReviews((prev) => ({ ...prev, [eventId]: true }));

    try {
      const response = await apiService.getEventReviews(eventId);
      if (response.success) {
        setEventReviews((prev) => ({
          ...prev,
          [eventId]: response.data.reviews || [],
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch reviews for event ${eventId}:`, error);
      setEventReviews((prev) => ({
        ...prev,
        [eventId]: [],
      }));
    } finally {
      setLoadingReviews((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  // Handle review button click
  const handleReviewEvent = async (event) => {
    if (!isUserLoggedIn) {
      await Swal.fire({
        icon: "warning",
        title: "Authentication Required",
        text: "Please login to review events",
        confirmButtonText: "Go to Login",
        confirmButtonColor: "#700e12",
      });
      navigate("/user");
      return;
    }

    setReviewingEvent(event);
    setReviewRating(0);
    setReviewText("");
    setShowReviewModal(true);
  };

  // Submit review
  const submitReview = async () => {
    if (!reviewingEvent || reviewRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating before submitting your review.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmittingReview(true);
      const userData = localStorage.getItem("user");
      if (!userData) {
        navigate("/user");
        return;
      }

      const user = JSON.parse(userData);

      const response = await apiService.submitEventReview(
        reviewingEvent.id,
        user.id,
        reviewRating,
        reviewText.trim() || null,
      );

      if (response.success) {
        await Swal.fire({
          icon: "success",
          title: "Review Submitted! ⭐",
          html: `
            <div class="text-left">
              <p>Thank you for reviewing <strong>"${reviewingEvent.title}"</strong>!</p>
              <br>
              <div class="bg-gray-50 p-3 rounded">
                <p><strong>⭐ Your Rating:</strong> ${reviewRating}/5 stars</p>
                ${reviewText.trim() ? `<p><strong>💬 Your Review:</strong> "${reviewText.trim()}"</p>` : ""}
              </div>
              <br>
              <p class="text-center">Your feedback helps improve our community events! 🎊</p>
            </div>
          `,
          confirmButtonText: "Great!",
          confirmButtonColor: "#700e12",
        });

        // Update review status for this event
        setEventReviewStatus((prev) => ({
          ...prev,
          [reviewingEvent.id]: {
            ...prev[reviewingEvent.id],
            can_review: false,
            has_reviewed: true,
            existing_rating: reviewRating,
            existing_review: reviewText.trim() || null,
          },
        }));

        // Refresh reviews for this event to show the new review
        setEventReviews((prev) => ({ ...prev, [reviewingEvent.id]: null })); // Clear cache
        fetchEventReviews(reviewingEvent.id);

        setShowReviewModal(false);
        setReviewingEvent(null);
        setReviewRating(0);
        setReviewText("");
      } else {
        throw new Error(response.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      await Swal.fire({
        icon: "error",
        title: "Review Submission Failed",
        text:
          error.message || "Failed to submit your review. Please try again.",
        confirmButtonColor: "#700e12",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("community");
  const [contactInfo, setContactInfo] = useState("");

  // Form validation and submission states
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Categories from API
  const [categories, setCategories] = useState([]);

  // Filter and sort events function
  const getFilteredAndSortedEvents = (events) => {
    let filtered = [...events];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.organizer?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== "all-categories") {
      const categoryName = selectedCategory.startsWith("filter-skill-")
        ? skillSets[parseInt(selectedCategory.replace("filter-skill-", ""))]
        : selectedCategory;
      filtered = filtered.filter(
        (event) =>
          event.category?.toLowerCase() === categoryName?.toLowerCase(),
      );
    }

    // Apply location filter
    if (selectedLocation && selectedLocation !== "all-locations") {
      filtered = filtered.filter((event) =>
        event.location?.toLowerCase().includes(selectedLocation.toLowerCase()),
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.event_date) - new Date(b.event_date);
        case "location":
          return (a.location || "").localeCompare(b.location || "");
        case "category":
          return (a.category || "").localeCompare(b.category || "");
        case "availability":
          const aAvailable =
            (a.max_participants || 0) - (a.current_participants || 0);
          const bAvailable =
            (b.max_participants || 0) - (b.current_participants || 0);
          return bAvailable - aAvailable; // Higher availability first
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Get filtered events for display
  const filteredCurrentEvents = getFilteredAndSortedEvents(currentEvents);
  const filteredPastEvents = getFilteredAndSortedEvents(pastEvents);

  // Pagination state (at the top)
  const [currentEventsPage, setCurrentEventsPage] = useState(1);
  const [pastEventsPage, setPastEventsPage] = useState(1);
  const PAGE_SIZE = 10;

  // Paginated slices
  const paginatedCurrentEvents = filteredCurrentEvents.slice(
    (currentEventsPage - 1) * PAGE_SIZE,
    currentEventsPage * PAGE_SIZE,
  );
  const paginatedPastEvents = filteredPastEvents.slice(
    (pastEventsPage - 1) * PAGE_SIZE,
    pastEventsPage * PAGE_SIZE,
  );

  const totalCurrentPages = Math.ceil(filteredCurrentEvents.length / PAGE_SIZE);
  const totalPastPages = Math.ceil(filteredPastEvents.length / PAGE_SIZE);

  // Shim for pagination controls
  const TablePagination = ({ currentPage, setCurrentPage, totalPages }) => (
    <div className="flex mx-auto w-full justify-center gap-5 items-center mt-2">
      <button
        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>
      <span className="mx-2 text-xs">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );

  // Get unique locations from all events for dynamic location filter
  const allEvents = [...currentEvents, ...pastEvents];
  const uniqueLocations = [
    ...new Set(
      allEvents.map((event) => event.location?.trim()).filter(Boolean),
    ),
  ].sort();
  // Check if user has already joined an event
  const checkUserJoinedEvent = async (eventId, userId) => {
    try {
      const joinedEvents = await apiService.getUserJoinedEvents(userId);
      return joinedEvents.some((event) => event.id === eventId);
    } catch (error) {
      console.error("Error checking user joined events:", error);
      return false;
    }
  };

  // Handle join event with authentication check and capacity validation
  const handleJoinEvent = async (eventId) => {
    if (!isUserLoggedIn) {
      await Swal.fire({
        icon: "warning",
        title: "Authentication Required",
        text: "Please login to join events",
        confirmButtonText: "Go to Login",
        confirmButtonColor: "#700e12",
      });
      navigate("/user");
      return;
    }

    // Check if user is approved
    if (!isUserApproved) {
      toast({
        title: "Approval Required",
        description:
          "You are not approved to join events. Please wait for admin approval.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        navigate("/user");
        return;
      }

      const user = JSON.parse(userData);

      // Check if user has already joined this event
      const hasJoined = await checkUserJoinedEvent(eventId, user.id);
      if (hasJoined) {
        await Swal.fire({
          icon: "info",
          title: "Already Joined",
          text: "You have already joined this event!",
          confirmButtonColor: "#700e12",
        });
        return;
      }

      // Find the event to check capacity
      const allEventsData = [...currentEvents, ...pastEvents];
      const targetEvent = allEventsData.find((event) => event.id === eventId);

      if (!targetEvent) {
        await Swal.fire({
          icon: "error",
          title: "Event Not Found",
          text: "Event not found. Please refresh the page and try again.",
          confirmButtonColor: "#700e12",
        });
        return;
      }

      // Check if event is full
      const currentParticipants = targetEvent.current_participants || 0;
      const maxParticipants = targetEvent.max_participants || 0;
      const availableSpots = maxParticipants - currentParticipants;

      if (currentParticipants >= maxParticipants) {
        await Swal.fire({
          icon: "error",
          title: "Event Full",
          text: "Sorry, this event is full! There are no available spots remaining.",
          confirmButtonColor: "#700e12",
        });
        return;
      }

      // Check if event has started
      if (hasEventStarted(targetEvent)) {
        await Swal.fire({
          icon: "error",
          title: "Event Started",
          text: "Sorry, you cannot join events that have already started.",
          confirmButtonColor: "#700e12",
        });
        return;
      }

      // Show confirmation with available spots info and approval process
      const result = await Swal.fire({
        icon: "question",
        title: `Request to Join "${targetEvent.title}"?`,
        html: `
          <div class="text-left">
            <p><strong>📅 Date:</strong> ${formatDate(targetEvent.event_date)}</p>
            <p><strong>⏰ Time:</strong> ${formatTime(targetEvent.start_time)}</p>
            <p><strong>📍 Location:</strong> ${targetEvent.location}</p>
            <p><strong>👥 Available spots:</strong> ${availableSpots} out of ${maxParticipants}</p>
            <br>
            <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
              <p><strong>ℹ️ Approval Process:</strong></p>
              <p>• Your request will be sent to the event organizer</p>
              <p>• You'll receive an email notification once approved</p>
              <p>• Check your notifications for updates</p>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Submit Request",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#700e12",
        cancelButtonColor: "#6c757d",
      });

      if (!result.isConfirmed) {
        return;
      }

      // Set loading state
      setJoiningEventId(eventId);

      // Show loading toast
      toast({
        title: "Submitting Request...",
        description: "Please wait while we submit your join request.",
      });

      // Call the API to join the event
      const response = await apiService.joinEvent(eventId, user.id);

      // Success notification with SweetAlert - Updated for approval system
      await Swal.fire({
        icon: "info",
        title: "Join Request Submitted! ⏳",
        html: `
          <div class="text-left">
            <p>Your request to join <strong>"${targetEvent.title}"</strong> has been submitted!</p>
            <br>
            <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
              <p><strong>⏳ Pending Approval:</strong> Your request is now being reviewed by the event organizer.</p>
              <p><strong>📧 Email Notification:</strong> You will receive an email once your participation is approved.</p>
              <p><strong>🔔 Notification:</strong> Check your notifications tab for updates.</p>
            </div>
            <br>
            <div class="bg-gray-50 p-3 rounded">
              <p><strong>📅 Date:</strong> ${formatDate(targetEvent.event_date)}</p>
              <p><strong>⏰ Time:</strong> ${formatTime(targetEvent.start_time)}</p>
              <p><strong>📍 Location:</strong> ${targetEvent.location}</p>
            </div>
            <br>
            <p class="text-center"><strong>Thank you for your interest! 🙏</strong></p>
          </div>
        `,
        confirmButtonText: "Understood",
        confirmButtonColor: "#700e12",
      });

      // Success toast - Updated for approval system
      toast({
        title: "Join Request Submitted! ⏳",
        description: `Your request to join "${targetEvent.title}" is pending approval from the event host.`,
      });

      // Refresh events data to get updated participant count
      loadEventsData();
    } catch (error) {
      console.error("Error joining event:", error);

      // Handle specific error messages from API
      let errorTitle = "Join Failed";
      let errorMessage = "Failed to join event. Please try again.";

      if (error.message) {
        if (error.message.includes("already joined")) {
          errorTitle = "Already Joined";
          errorMessage = "You have already joined this event!";
        } else if (error.message.includes("full")) {
          errorTitle = "Event Full";
          errorMessage = "Sorry, this event is now full!";
        } else if (
          error.message.includes("expired") ||
          error.message.includes("past") ||
          error.message.includes("started")
        ) {
          errorTitle = "Event Started";
          errorMessage =
            "Sorry, you cannot join events that have already started.";
        } else if (error.message.includes("unauthorized")) {
          errorTitle = "Authentication Error";
          errorMessage = "Please login again to join events.";
          await Swal.fire({
            icon: "error",
            title: errorTitle,
            text: errorMessage,
            confirmButtonColor: "#700e12",
          });
          localStorage.removeItem("user");
          localStorage.removeItem("userToken");
          navigate("/user");
          return;
        } else {
          errorMessage = error.message;
        }
      }

      // Error notification
      await Swal.fire({
        icon: "error",
        title: errorTitle,
        text: errorMessage,
        confirmButtonColor: "#700e12",
      });

      // Error toast
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      // Reset loading state
      setJoiningEventId(null);
    }
  };

  // Handle create event with authentication check
  const handleCreateEvent = () => {
    if (!isUserLoggedIn) {
      navigate("/user");
      return;
    }

    // Check if user is approved
    if (!isUserApproved) {
      toast({
        title: "Approval Required",
        description:
          "You are not approved to create events. Please wait for admin approval.",
        variant: "destructive",
      });
      return;
    }

    // Load user location data when opening the form
    loadUserLocationData();
    setShowCreateEvent(true);
  };

  // Form validation function
  const validateForm = () => {
    const errors = {};

    // Title validation
    if (!title.trim()) {
      errors.title = "Event title is required";
    } else if (title.trim().length < 3) {
      errors.title = "Event title must be at least 3 characters";
    } else if (title.trim().length > 255) {
      errors.title = "Event title must not exceed 255 characters";
    }

    // Category validation
    if (!category) {
      errors.category = "Please select a category";
    }

    // Date validation
    if (!date) {
      errors.date = "Event date is required";
    } else {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = "Event date cannot be in the past";
      }
    }

    // Time validation
    if (!time) {
      errors.time = "Start time is required";
    }

    if (!endTime) {
      errors.endTime = "End time is required";
    } else if (time && endTime <= time) {
      errors.endTime = "End time must be after start time";
    }

    // Location validation
    if (!location.trim()) {
      errors.location = "Location is required";
    } else if (location.trim().length < 3) {
      errors.location = "Location must be at least 3 characters";
    }

    // Max guests validation
    if (!maxGuests || maxGuests < 1) {
      errors.maxGuests = "Maximum guests must be at least 1";
    } else if (maxGuests > 100) {
      errors.maxGuests = "Maximum guests cannot exceed 100";
    }

    // Description validation
    if (!description.trim()) {
      errors.description = "Event description is required";
    } else if (description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    // Event type validation
    if (!eventType) {
      errors.eventType = "Please select an event type";
    }

    return errors;
  };

  // Reset form function
  const resetForm = () => {
    setTitle("");
    setCategory("");
    setDate("");
    setTime("");
    setEndTime("");
    setMaxGuests(1);
    setDescription("");
    setEventType("community");
    setContactInfo("");
    setFormErrors({});
    setSubmitError("");
    setSubmitSuccess(false);

    // Reload user location data instead of clearing location
    if (isUserLoggedIn) {
      loadUserLocationData();
    } else {
      setLocation("");
    }
  };

  // Enhanced form submission with API integration
  async function handleSubmitNewEvent() {
    // Reset previous states
    setFormErrors({});
    setSubmitError("");
    setSubmitSuccess(false);

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Get user information
    const userToken = localStorage.getItem("userToken");
    const userData = localStorage.getItem("user");

    if (!userToken || !userData) {
      setSubmitError("Please log in to create an event");
      navigate("/user");
      return;
    }

    let user;
    try {
      user = JSON.parse(userData);
    } catch (error) {
      setSubmitError("Invalid user data. Please log in again.");
      navigate("/user");
      return;
    }

    setIsSubmitting(true);

    try {
      // Find category ID
      const selectedCategory = categories.find((cat) => cat.name === category);
      const categoryId = selectedCategory ? selectedCategory.id : 1; // Default to first category

      // Prepare event data for API
      const eventData = {
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        location: location.trim(),
        event_date: date,
        start_time: time,
        end_time: endTime,
        max_participants: parseInt(maxGuests),
        organizer_id: user.id,
        status: "inactive", // Set to inactive for admin approval
        event_type: eventType,
        contact_info:
          contactInfo.trim() ||
          `${user.first_name} ${user.last_name} - ${user.email}`,
        is_featured: false,
        tags: [category, eventType],
        requirements: [],
      };

      // Submit to API
      const response = await apiService.createUserEvent(eventData);

      if (response.success) {
        setSubmitSuccess(true);

        // Send email notification (this would be handled by the backend)
        try {
          // You can add a separate API call here for email notifications if needed
          console.log(
            "Event created successfully, email notification should be sent by backend",
          );
        } catch (emailError) {
          console.error("Email notification failed:", emailError);
          // Don't fail the whole process if email fails
        }

        // Show success message and close modal after delay
        setTimeout(() => {
          setShowCreateEvent(false);
          resetForm();
          // Refresh events list to show the new event (if approved)
          loadEventsData();
        }, 2000);
      } else {
        setSubmitError(response.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Event creation error:", error);
      setSubmitError(
        error.message || "Failed to create event. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  // Prompt rating and move to past
  const [ratingDialog, setRatingDialog] = useState({
    open: false,
    event: null,
  });
  const [ratingVal, setRatingVal] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  const promptRating = (ev) => {
    setRatingVal(0);
    setFeedbackText("");
    setRatingDialog({ open: true, event: ev });
  };

  const handleSubmitRating = () => {
    if (!ratingDialog.event) return;
    const updated = {
      ...ratingDialog.event,
      status: "completed",
      rating: ratingVal,
      feedback: feedbackText,
    };
    setPastEvents((prev) => [...prev, updated]);
    setCurrentEvents((prev) =>
      prev.filter((e) => e.id !== ratingDialog.event.id),
    );
    setRatingDialog({ open: false, event: null });
  };

  // Check if event passed
  useInterval(() => {
    const now = new Date();
    currentEvents.forEach((ev) => {
      const eventTime = new Date(`${ev.date}T${ev.time}`);
      if (!ev.reviewed && now >= eventTime) {
        ev.reviewed = true;
        promptRating(ev);
      }
    });
  }, 60000);

  useEffect(() => {
    // Initial launch check
    currentEvents.forEach((ev) => {
      const eventTime = new Date(`${ev.date}T${ev.time}`);
      if (!ev.reviewed && new Date() >= eventTime) {
        ev.reviewed = true;
        promptRating(ev);
      }
    });
  }, [currentEvents]);

  // const skillSets = [
  //   "Artistic activities",
  //   "Community/Social service",
  //   "Cooking or baking",
  //   "Healthcare",
  //   "Playing a musical instrument",
  //   "Games/Sports",
  //   "Outdoor games",
  //   "Cycling/Swimming",
  //   "Photography",
  //   "Blog Writing",
  //   "Religious Discussions",
  //   "Political discussions",
  //   "Exploring Culture",
  //   "Dancing",
  //   "Charity",
  //   "Stand-up Comedy",
  //   "Journalism",
  //   "Gardening",
  //   "Farming",
  //   "Calligraphy",
  //   "Yoga and Nature Cure",
  //   "Quiz, Crossword puzzles",
  //   "Antakshari, Tambola",
  //   "Meditation, Wellness",
  //   "Devotional Discussions",
  //   "Indian Festivals, Songs",
  //   "Mindful Morning",
  // ];

  const FilterSidebar = () => (
    <>
      {/* Mobile Only Header */}
      <div className="lg:hidden flex justify-between items-center mb-4 max-lg:ml-3">
        <h3 className="text-lg font-bold text-share2care-red">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMobileFilters(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 max-lg:ml-3">
        {/* Search Events */}
        <div className="flex flex-col space-y-2 min-w-[220px] lg:flex-1">
          <Label
            htmlFor="search"
            className="text-sm font-semibold text-gray-700"
          >
            Search Events
          </Label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              type="text"
              id="search"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-gray-300 focus:border-share2care-red"
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="flex flex-col space-y-2 min-w-[180px]">
          <Label className="text-sm font-semibold text-gray-700">Sort By</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="border-gray-300 focus:border-share2care-red">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="location">Sort by Location</SelectItem>
              <SelectItem value="category">Sort by Category</SelectItem>
              <SelectItem value="availability">Sort by Availability</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="flex flex-col space-y-2 min-w-[180px]">
          <Label className="text-sm font-semibold text-gray-700">
            Category
          </Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="border-gray-300 focus:border-share2care-red">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all-categories">All Categories</SelectItem>
              {categories.length > 0
                ? getUniqueActiveCategories(categories).map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))
                : ""}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="flex flex-col space-y-2 min-w-[180px]">
          <Label className="text-sm font-semibold text-gray-700">
            Location
          </Label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="border-gray-300 focus:border-share2care-red">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-locations">All Locations</SelectItem>
              {uniqueLocations.length > 0 ? (
                uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location.toLowerCase()}>
                    {location}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="chennai">Chennai</SelectItem>
                  <SelectItem value="kolkata">Kolkata</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Button */}
        <div className="flex items-end min-w-[180px]">
          <Button
            variant="outline"
            className="w-full border-share2care-red text-share2care-red hover:bg-share2care-red hover:text-white"
            onClick={() => {
              setSearchTerm("");
              setSortBy("date");
              setSelectedCategory("");
              setSelectedLocation("");
            }}
          >
            Clear All Filters
          </Button>
        </div>
      </div>
      {/*View Btn Toggle*/}
      <div className="flex justify-end mt-4 gap-2 max-lg:hidden">
        <Button
          onClick={() => setView("list")}
          className={`text-sm sm:text-base ${view === "list" ? "btn-share2care" : "btn-share2care-outline"}`}
        >
          <ListFilter />
        </Button>
        <Button
          onClick={() => setView("grid")}
          className={`text-sm sm:text-base ${view === "grid" ? `btn-share2care` : `btn-share2care-outline`}`}
        >
          <BsMicrosoft />
        </Button>
      </div>
    </>
  );

  const EventCard = ({
    event,
    showActions = true,
    handleJoinEvent,
    isUserLoggedIn,
    isUserApproved,
    joiningEventId,
    eventReviewStatus = {},
    handleReviewEvent,
    isPastEvent = false,
  }) => (
    <Card className="share2care-card h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg text-gray-900 mb-1">
              {event.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="secondary"
                className="bg-share2care-yellow text-share2care-red font-semibold"
              >
                {event.category}
              </Badge>
              <span className="text-xs text-gray-500">ID: {event.id}</span>
            </div>
          </div>
          <Badge
            variant={event.status === "full" ? "destructive" : "default"}
            className={
              event.status === "full"
                ? "bg-red-100 text-red-800"
                : event.status === "completed"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-green-100 text-green-800"
            }
          >
            {event.status === "full"
              ? "Full"
              : event.status === "completed"
                ? "Completed"
                : "Available"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(event.event_date || event.date)}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            {formatTime(event.start_time || event.time)}
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {event.location}
          </div>
          <div className="flex items-center text-gray-600">
            <UserCircle className="w-4 h-4 mr-2" />
            Host: {event.host}
          </div>
        </div>

        {event.maxGuests && (
          <div className="flex items-center text-gray-600 text-sm">
            <Users className="w-4 h-4 mr-2" />
            {event.joinedGuests}/{event.maxGuests} joined
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
        </div>

        {event.rating && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium mr-2">Rating:</span>
              <div className="flex">
                {[...Array(event.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                  />
                ))}
              </div>
            </div>
            {event.feedback && (
              <p className="text-sm text-gray-600 italic">"{event.feedback}"</p>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setSelectedEvent({ ...event, isPastEvent });
                setShowDetailsModal(true);
                // Only fetch reviews if user is logged in
                if (isUserLoggedIn) {
                  fetchEventReviews(event.id);
                }
              }}
            >
              View Details
            </Button>

            {/* Review Button for Past Events */}
            {isPastEvent &&
              isUserLoggedIn &&
              eventReviewStatus[event.id]?.can_review && (
                <Button
                  size="sm"
                  className="btn-share2care flex-1"
                  onClick={() => handleReviewEvent(event)}
                >
                  <Star className="w-4 h-4 mr-1" />
                  Write Review
                </Button>
              )}

            {/* Show if already reviewed */}
            {isPastEvent &&
              isUserLoggedIn &&
              eventReviewStatus[event.id]?.has_reviewed && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 cursor-not-allowed"
                  disabled
                >
                  <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                  Reviewed
                </Button>
              )}

            {/* Join Button - Only show for current events */}
            {!isPastEvent && (
              <Button
                size="sm"
                disabled={
                  event.status === "full" ||
                  joiningEventId === event.id ||
                  (isUserLoggedIn && !isUserApproved)
                }
                className="btn-share2care flex-1"
                onClick={() => handleJoinEvent(event.id)}
              >
                {joiningEventId === event.id ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Joining...
                  </div>
                ) : event.status === "full" ? (
                  "Event Full"
                ) : !isUserLoggedIn ? (
                  "Login to Join"
                ) : !isUserApproved ? (
                  "Approval Required"
                ) : (
                  "Join Event"
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="h-screen overflow-x-hidden bg-gray-50">
      {/* Header Component */}
      <Header />
      <div className="w-full mt-32 py-2 px-8 flex flex-col bg-[#70363a] text-white justify-center items-center mb-5">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          Upcoming and Past Events
        </h2>
        <hr className="h-0.5 bg-white text-white w-full max-w-96" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-3">
        {/* Hero Section */}
        {/* <EventFrontBox isUserLoggedIn={isUserLoggedIn} uniqueLocations={uniqueLocations} categoryCount={categoryCount} currentEvents={currentEvents} loading={loading}/> */}
        {/* Rating Dialog */}
        <Dialog
          open={ratingDialog.open}
          onOpenChange={(open) =>
            setRatingDialog({ open, event: open ? ratingDialog.event : null })
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {ratingDialog.event
                  ? `Rate "${ratingDialog.event.title}"`
                  : "Rate Event"}
              </DialogTitle>
              <DialogDescription>
                Please rate and provide feedback for this event.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-6 h-6 cursor-pointer ${n <= ratingVal ? "text-yellow-400" : "text-gray-300"}`}
                    onClick={() => setRatingVal(n)}
                    data-testid={`star-${n}`}
                  />
                ))}
              </div>
              <Textarea
                placeholder="Your feedback"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleSubmitRating} disabled={ratingVal === 0}>
                  Submit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRatingDialog({ open: false, event: null })}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <section>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-8 gap-2">
            <div>
              <p className="text-gray-600 font-semibold text-lg">
                Filter and find the perfect activities for you
              </p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden flex-1 sm:flex-none"
                onClick={() => setShowMobileFilters(true)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Dialog
                open={showCreateEvent}
                onOpenChange={(open) => {
                  if (open && isUserLoggedIn) {
                    loadUserLocationData();
                  }
                  setShowCreateEvent(open);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    className="btn-share2care text-sm flex-1 sm:flex-none"
                    onClick={handleCreateEvent}
                    disabled={isUserLoggedIn && !isUserApproved}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Create Event</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                      Create a new time-sharing event for the community.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Success Message */}
                    {submitSuccess && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <div>
                            <h4 className="text-green-800 font-medium">
                              Event Created Successfully!
                            </h4>
                            <p className="text-green-700 text-sm mt-1">
                              Your event has been submitted for admin approval.
                              You'll receive an email confirmation shortly.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <XCircle className="w-5 h-5 text-red-600 mr-2" />
                          <div>
                            <h4 className="text-red-800 font-medium">
                              Error Creating Event
                            </h4>
                            <p className="text-red-700 text-sm mt-1">
                              {submitError}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-title">Event Title *</Label>
                        <Input
                          id="event-title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter event title"
                          className={formErrors.title ? "border-red-500" : ""}
                        />
                        {formErrors.title && (
                          <p className="text-red-500 text-sm">
                            {formErrors.title}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Category/Skill Set *</Label>
                        <Select onValueChange={setCategory} value={category}>
                          <SelectTrigger
                            className={
                              formErrors.category ? "border-red-500" : ""
                            }
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {getUniqueActiveCategories(categories).map(
                              (cat) => (
                                <SelectItem key={cat.id} value={cat.name}>
                                  {cat.name}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        {formErrors.category && (
                          <p className="text-red-500 text-sm">
                            {formErrors.category}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-date">Date *</Label>
                        <Input
                          id="event-date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          min={
                            new Date(Date.now() + 1 + 24 * 60 * 60 * 1000)
                              .toISOString()
                              .split("T")[0]
                          }
                          max={
                            new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                              .toISOString()
                              .split("T")[0]
                          }
                          className={formErrors.date ? "border-red-500" : ""}
                        />
                        {formErrors.date && (
                          <p className="text-red-500 text-sm">
                            {formErrors.date}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-time">Start Time *</Label>
                        <Input
                          id="event-time"
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className={formErrors.time ? "border-red-500" : ""}
                        />
                        {formErrors.time && (
                          <p className="text-red-500 text-sm">
                            {formErrors.time}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-end-time">End Time *</Label>
                        <Input
                          id="event-end-time"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className={formErrors.endTime ? "border-red-500" : ""}
                        />
                        {formErrors.endTime && (
                          <p className="text-red-500 text-sm">
                            {formErrors.endTime}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-location">Location *</Label>
                        <Input
                          id="event-location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder={
                            userLocationData
                              ? "Auto-filled from your profile"
                              : "Enter location"
                          }
                          className={`${formErrors.location ? "border-red-500" : ""} ${userLocationData ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          readOnly={!!userLocationData}
                          disabled={!!userLocationData}
                        />
                        {userLocationData && (
                          <p className="text-sm text-blue-600 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            Auto-filled from your profile address
                          </p>
                        )}
                        {formErrors.location && (
                          <p className="text-red-500 text-sm">
                            {formErrors.location}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-guests">Max Participants *</Label>
                        <Input
                          id="max-guests"
                          type="number"
                          value={maxGuests}
                          onChange={(e) => setMaxGuests(Number(e.target.value))}
                          min={1}
                          max={100}
                          className={
                            formErrors.maxGuests ? "border-red-500" : ""
                          }
                        />
                        {formErrors.maxGuests && (
                          <p className="text-red-500 text-sm">
                            {formErrors.maxGuests}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-type">Event Type *</Label>
                      <Select onValueChange={setEventType} value={eventType}>
                        <SelectTrigger
                          className={
                            formErrors.eventType ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="charity">Charity</SelectItem>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                          <SelectItem value="fundraising">
                            Fundraising
                          </SelectItem>
                          <SelectItem value="awareness">Awareness</SelectItem>
                          <SelectItem value="community">Community</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.eventType && (
                        <p className="text-red-500 text-sm">
                          {formErrors.eventType}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-description">Description *</Label>
                      <Textarea
                        id="event-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Describe your event (minimum 10 characters)"
                        className={
                          formErrors.description ? "border-red-500" : ""
                        }
                      />
                      {formErrors.description && (
                        <p className="text-red-500 text-sm">
                          {formErrors.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-info">
                        Contact Information (Optional)
                      </Label>
                      <Input
                        id="contact-info"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder="Additional contact details (phone, email, etc.)"
                      />
                      <p className="text-sm text-gray-500">
                        If not provided, your registered name and email will be
                        used
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                        <div>
                          <h4 className="text-blue-800 font-medium">
                            Admin Approval Required
                          </h4>
                          <p className="text-blue-700 text-sm mt-1">
                            Your event will be reviewed by our admin team before
                            being published. You'll receive an email
                            notification once it's approved.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={handleSubmitNewEvent}
                        disabled={isSubmitting}
                        className="flex items-center"
                      >
                        {isSubmitting && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {isSubmitting ? "Creating Event..." : "Create Event"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCreateEvent(false);
                          resetForm();
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filter Sidebar */}
          <div className="hidden lg:block w-100">
            <FilterSidebar />
          </div>
          <div className="flex gap-6">
            {/* Mobile Filter Overlay */}
            {showMobileFilters && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
                <div className="fixed left-0 top-0 h-full w-80 bg-white">
                  <FilterSidebar />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-5">
            {/* Main Content */}
            <div className="flex-1 mt-5">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-sm:w-screen mb-5 grid-cols-2">
                  <TabsTrigger
                    value="current"
                    className="text-sm sm:text-base hover:bg-[#700e12] hover:text-white"
                  >
                    Active Events
                  </TabsTrigger>
                  <TabsTrigger
                    value="past"
                    className="text-sm sm:text-base hover:bg-[#700e12] hover:text-white"
                  >
                    Past Events
                  </TabsTrigger>
                </TabsList>

                {/*Active Events */}
                <TabsContent value="current" className=" space-y-2">
                  <div className="text-center mb-4">
                    <p className="text-gray-600 text-sm">
                      {isUserLoggedIn
                        ? ""
                        : "Login to join events and interact with the community"}
                    </p>
                  </div>

                  {loading && (
                    <div className="text-center py-5">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-share2care-red mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading events...</p>
                    </div>
                  )}

                  {error && (
                    <div className="text-center py-5">
                      <p className="text-red-600 mb-4">{error}</p>
                      <Button onClick={loadEventsData} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  )}

                  {!loading && !error && (
                    <>
                      {/*Active Events Cards*/}
                      {view === "grid" ? (
                        <div className="space-y-4">
                          {filteredCurrentEvents.map((event) => (
                            <EventCard
                              key={event.id}
                              event={{
                                ...event,
                                date: event.event_date,
                                time: event.start_time,
                                host: event.organizer || "Event Organizer",
                                maxGuests: event.max_participants,
                                joinedGuests: event.current_participants || 0,
                                category: event.category || "General",
                                status:
                                  event.current_participants >=
                                  event.max_participants
                                    ? "full"
                                    : "active",
                              }}
                              handleJoinEvent={handleJoinEvent}
                              isUserLoggedIn={isUserLoggedIn}
                              isUserApproved={isUserApproved}
                              joiningEventId={joiningEventId}
                              eventReviewStatus={eventReviewStatus}
                              handleReviewEvent={handleReviewEvent}
                              isPastEvent={false}
                              showActions={true}
                            />
                          ))}
                          {filteredCurrentEvents.length === 0 && (
                            <div className="text-center py-8">
                              <p className="text-gray-600">
                                {currentEvents.length === 0
                                  ? "No active events found."
                                  : "No events match your current filters."}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : ( 
                        <div className="w-full max-w-7xl overflow-x-auto">
                        <div className="overflow-y-auto max-h-96 border rounded">
                         <table className="min-w-full border border-gray-200 text-sm text-left">
                         <thead className="bg-gray-100 text-gray-700">
                              <tr>
                                <th className="px-4 py-2 border">Event Name</th>
                                <th className="px-4 py-2 border">Place</th>
                                <th className="px-4 py-2 border">Date</th>
                                <th className="px-4 py-2 border">
                                  Participants
                                </th>
                                <th className="px-4 py-2 border">Status</th>
                                <th className="px-4 py-2 border text-center">
                                  Actions
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {paginatedCurrentEvents.map((event) => (
                                <tr
                                  key={event.id}
                                  className="odd:bg-white even:bg-gray-200 hover:bg-gray-100 transition-colors"
                                >
                                  <td className="px-4 py-2 border">
                                    {event.title}
                                  </td>
                                  <td className="px-4 py-2 border">
                                    {event.location}
                                  </td>
                                  <td className="px-4 py-2 border">
                                    {formatDate(event.event_date)}
                                  </td>
                                  <td className="px-4 py-2 border">
                                    <div className="flex items-center gap-1">
                                      <Users className="w-4 h-4 text-gray-500" />
                                      <span
                                        className={
                                          event.current_participants >=
                                          event.max_participants
                                            ? "text-red-600 font-medium"
                                            : "text-gray-700"
                                        }
                                      >
                                        {event.current_participants || 0}/
                                        {event.max_participants || 0}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 border">
                                    <Badge
                                      variant={
                                        event.current_participants >=
                                        event.max_participants
                                          ? "destructive"
                                          : "default"
                                      }
                                      className={
                                        event.current_participants >=
                                        event.max_participants
                                          ? "bg-red-100 text-red-800"
                                          : "bg-green-100 text-green-800"
                                      }
                                    >
                                      {event.current_participants >=
                                      event.max_participants
                                        ? "Full"
                                        : "Available"}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-2 border text-center">
                                    <div className="flex gap-2 justify-center">
                                      <button
                                        onClick={() => {
                                          setSelectedEvent({
                                            ...event,
                                            date: event.event_date,
                                            time: event.start_time,
                                            host:
                                              event.organizer ||
                                              "Event Organizer",
                                            status:
                                              event.current_participants >=
                                              event.max_participants
                                                ? "full"
                                                : "active",
                                            isPastEvent: false,
                                          });
                                          setShowDetailsModal(true);
                                          // Only fetch reviews if user is logged in
                                          if (isUserLoggedIn) {
                                            fetchEventReviews(event.id);
                                          }
                                        }}
                                        title="View Details"
                                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                                      >
                                        View
                                      </button>
                                      {/* <Button
                                        size="sm"
                                        disabled={event.current_participants >= event.max_participants || joiningEventId === event.id || (isUserLoggedIn && !isUserApproved)}
                                        className="btn-share2care text-xs px-2 py-1"
                                        onClick={() => handleJoinEvent(event.id)}
                                      >
                                        {joiningEventId === event.id ? (
                                          <div className="flex items-center gap-1">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Joining...
                                          </div>
                                        ) : event.current_participants >= event.max_participants ? (
                                          "Full"
                                        ) : !isUserLoggedIn ? (
                                          "Login"
                                        ) : !isUserApproved ? (
                                          "Not Approved"
                                        ) : (
                                          "Join"
                                        )}
                                      </Button> */}
                                    </div>
                                  </td>
                                </tr>
                              ))}

                              {/* No Events Fallback */}
                              {paginatedCurrentEvents.length === 0 && (
                                <tr>
                                  <td
                                    colSpan="6"
                                    className="text-center text-gray-500 py-4 border"
                                  >
                                    {currentEvents.length === 0
                                      ? "No upcoming events found."
                                      : "No events match your current filters."}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>

                        
                          {/* DETAILS MODAL */}
                        </div>
                      <TablePagination
                        currentPage={currentEventsPage}
                        setCurrentPage={setCurrentEventsPage}
                        totalPages={totalCurrentPages}
                      />
                        </div>
                      )}
                    </>
                  )}
                  {/* Login Prompt for joining events */}
                  {!isUserLoggedIn && (
                    <p className="text-center font-medium text-sm text-gray-700 mt-4">
                      Login to join events and write reviews
                    </p>
                  )}

                  
                </TabsContent>

                {/*Past Events */}
                <TabsContent value="past" className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-gray-600 text-sm">
                      Explore completed events and their feedback
                    </p>
                  </div>

                  {!loading && !error && (
                    <>
                      {/*Past Events Cards*/}
                      {view === "grid" ? (
                        <div className="space-y-4">
                          {filteredPastEvents.map((event) => (
                            <EventCard
                              key={event.id}
                              event={{
                                ...event,
                                date: event.event_date,
                                time: event.start_time,
                                host: event.organizer || "Event Organizer",
                                maxGuests: event.max_participants,
                                joinedGuests: event.current_participants || 0,
                                category: event.category || "General",
                                status: "completed",
                              }}
                              showActions={true}
                              handleJoinEvent={handleJoinEvent}
                              isUserLoggedIn={isUserLoggedIn}
                              isUserApproved={isUserApproved}
                              joiningEventId={joiningEventId}
                              eventReviewStatus={eventReviewStatus}
                              handleReviewEvent={handleReviewEvent}
                              isPastEvent={true}
                            />
                          ))}
                          {filteredPastEvents.length === 0 && (
                            <div className="text-center py-8">
                              <p className="text-gray-600">
                                {pastEvents.length === 0
                                  ? "No past events found."
                                  : "No events match your current filters."}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                       <div className="overflow-x-auto relative">
                      <div className="overflow-y-auto max-h-96 border rounded">
                        <table className="min-w-full border border-gray-200 text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700">
                              <tr>
                                <th className="px-4 py-2 border">Event Name</th>
                                <th className="px-4 py-2 border">Place</th>
                                <th className="px-4 py-2 border">Date</th>
                                <th className="px-4 py-2 border">
                                  Participants
                                </th>
                                <th className="px-4 py-2 border">Status</th>
                                <th className="px-4 py-2 border text-center">
                                  View Details
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedPastEvents.map((event) => (
                                <tr
                                  key={event.id}
                                  className="odd:bg-white even:bg-gray-200 hover:bg-gray-100"
                                >
                                  <td className="px-4 py-2 border">
                                    {event.title}
                                  </td>
                                  <td className="px-4 py-2 border">
                                    {event.location}
                                  </td>
                                  <td className="px-4 py-2 border">
                                    {formatDate(event.event_date)}
                                  </td>
                                  <td className="px-4 py-2 border">
                                    <div className="flex items-center gap-1">
                                      <Users className="w-4 h-4 text-gray-500" />
                                      <span className="text-gray-700">
                                        {event.current_participants || 0}/
                                        {event.max_participants || 0}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 border">
                                    <Badge className="bg-gray-100 text-gray-800">
                                      Completed
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-2 border text-center">
                                    <button
                                      onClick={() => {
                                        setSelectedEvent({
                                          ...event,
                                          date: event.event_date,
                                          time: event.start_time,
                                          host:
                                            event.organizer ||
                                            "Event Organizer",
                                          isPastEvent: true,
                                        });
                                        setShowDetailsModal(true);
                                        // Only fetch reviews if user is logged in
                                        if (isUserLoggedIn) {
                                          fetchEventReviews(event.id);
                                        }
                                      }}
                                      title="View Details"
                                      className="hover:text-red-share2care text-lg underline"
                                    >
                                      View
                                    </button>
                                  </td>
                                </tr>
                              ))}

                              {/* No Events Fallback */}
                              {paginatedPastEvents.length === 0 && (
                                <tr>
                                  <td
                                    colSpan="6"
                                    className="text-center text-gray-500 py-4 border"
                                  >
                                    {pastEvents.length === 0
                                      ? "No past events found."
                                      : "No events match your current filters."}
                                  </td>
                                </tr>
                              )}
                               
                            </tbody>
                          </table>

                          {/* DETAILS MODAL */}
                        </div>
                      <TablePagination
                        currentPage={pastEventsPage}
                        setCurrentPage={setPastEventsPage}
                        totalPages={totalPastPages}
                      />
                      </div>
                  )}
                    </>
                  )}

                  {/* Login Prompt for joining events */}
                  {!isUserLoggedIn && (
                    <p className="text-center font-medium text-sm text-gray-700 mt-4">
                      Login to join events and write reviews
                    </p>
                  )}
                
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Important Note */}
        {!isUserLoggedIn && (
          <Card className="mt-8 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800 mb-1">
                    New to Events?
                  </h4>
                  <p className="text-sm text-orange-700">
                    {isUserLoggedIn
                      ? "Create your first event or join existing ones to connect with fellow elders in your community."
                      : "Create an account to start participating in community events and connect with other elders."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Unified Event Details Modal */}
      {showDetailsModal && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-xl"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedEvent(null);
              }}
            >
              ×
            </button>

            <div className="space-y-6">
              {/* Event Title */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedEvent.title || selectedEvent.name}
                </h2>
                <p className="text-sm text-gray-600">
                  Event Details and Information
                </p>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-share2care-red" />
                      Date & Time
                    </h4>
                    <p className="text-gray-700">
                      {formatDate(
                        selectedEvent.event_date || selectedEvent.date,
                      )}
                    </p>
                    <p className="text-gray-700">
                      {formatTime(
                        selectedEvent.start_time || selectedEvent.time,
                      )}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-share2care-red" />
                      Location
                    </h4>
                    <p className="text-gray-700">
                      {selectedEvent.location || "Location not specified"}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-share2care-red" />
                      Participants
                    </h4>
                    <p className="text-gray-700">
                      {selectedEvent.current_participants ||
                        selectedEvent.joinedGuests ||
                        0}{" "}
                      /{" "}
                      {selectedEvent.max_participants ||
                        selectedEvent.maxGuests ||
                        "Unlimited"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <UserCircle className="w-4 h-4 mr-2 text-share2care-red" />
                      Host
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 relative">
                        {selectedEvent.organizer_profile_picture ||
                        selectedEvent.host_profile_picture ? (
                          <>
                            <img
                              src={getImageUrl(
                                selectedEvent.organizer_profile_picture ||
                                  selectedEvent.host_profile_picture,
                              )}
                              alt="Host Profile"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.querySelector(
                                  ".fallback-avatar",
                                ).style.display = "flex";
                              }}
                            />
                            <div
                              className="fallback-avatar w-full h-full bg-share2care-red flex items-center justify-center text-white font-semibold text-lg absolute inset-0"
                              style={{ display: "none" }}
                            >
                              {(
                                selectedEvent.organizer ||
                                selectedEvent.host ||
                                "Event Organizer"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-share2care-red flex items-center justify-center text-white font-semibold text-lg">
                            {(
                              selectedEvent.organizer ||
                              selectedEvent.host ||
                              "Event Organizer"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">
                          {selectedEvent.organizer ||
                            selectedEvent.host ||
                            "Event Organizer"}
                        </p>
                        <p className="text-gray-500 text-sm">Event Host</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Category
                    </h4>
                    <Badge
                      variant="secondary"
                      className="bg-share2care-red/10 text-share2care-red"
                    >
                      {selectedEvent.category || "General"}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                    <Badge
                      variant={
                        (selectedEvent.current_participants ||
                          selectedEvent.joinedGuests ||
                          0) >=
                          (selectedEvent.max_participants ||
                            selectedEvent.maxGuests ||
                            Number.POSITIVE_INFINITY) ||
                        selectedEvent.status === "full"
                          ? "destructive"
                          : "default"
                      }
                      className={
                        (selectedEvent.current_participants ||
                          selectedEvent.joinedGuests ||
                          0) >=
                          (selectedEvent.max_participants ||
                            selectedEvent.maxGuests ||
                            Number.POSITIVE_INFINITY) ||
                        selectedEvent.status === "full"
                          ? ""
                          : selectedEvent.isPastEvent ||
                              selectedEvent.status === "completed" ||
                              hasEventEnded(selectedEvent)
                            ? "bg-gray-100 text-gray-800"
                            : "bg-green-100 text-green-800"
                      }
                    >
                      {(selectedEvent.current_participants ||
                        selectedEvent.joinedGuests ||
                        0) >=
                        (selectedEvent.max_participants ||
                          selectedEvent.maxGuests ||
                          Number.POSITIVE_INFINITY) ||
                      selectedEvent.status === "full"
                        ? "Event Full"
                        : selectedEvent.isPastEvent ||
                            selectedEvent.status === "completed" ||
                            hasEventEnded(selectedEvent)
                          ? "Completed"
                          : "Available"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Description
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedEvent.description ||
                    "No description provided for this event."}
                </p>
              </div>

              {/* Reviews Section */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  Event Reviews
                  {eventReviews[selectedEvent.id] &&
                    eventReviews[selectedEvent.id].length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {eventReviews[selectedEvent.id].length} review
                        {eventReviews[selectedEvent.id].length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                </h4>

                {loadingReviews[selectedEvent.id] ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    <span className="ml-2 text-gray-500">
                      Loading reviews...
                    </span>
                  </div>
                ) : eventReviews[selectedEvent.id] &&
                  eventReviews[selectedEvent.id].length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {eventReviews[selectedEvent.id].map((review, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-3 border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-share2care-red rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {review.reviewer_name
                                ? review.reviewer_name.charAt(0).toUpperCase()
                                : "U"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {review.reviewer_name || "Anonymous User"}
                              </p>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="text-xs text-gray-500 ml-1">
                                  ({review.rating}/5)
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {review.created_at
                              ? new Date(review.created_at).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                        {review.review && (
                          <p className="text-gray-700 text-sm leading-relaxed">
                            "{review.review}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Star className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No reviews yet for this event</p>
                    {selectedEvent.isPastEvent &&
                      isUserLoggedIn &&
                      eventReviewStatus[selectedEvent.id]?.can_review && (
                        <p className="text-xs mt-1">
                          Be the first to share your experience!
                        </p>
                      )}
                    {selectedEvent.isPastEvent && !isUserLoggedIn && (
                      <p className="text-xs mt-1">
                        Login to see and write reviews
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                {/* Join Button - Only for current events */}
                {!selectedEvent.isPastEvent && (
                  <Button
                    size="lg"
                    disabled={
                      selectedEvent.status === "full" ||
                      joiningEventId === selectedEvent.id ||
                      (isUserLoggedIn && !isUserApproved)
                    }
                    className="btn-share2care flex-1"
                    onClick={() => {
                      if (!isUserLoggedIn) {
                        setShowDetailsModal(false);
                        navigate("/user");
                      } else {
                        handleJoinEvent(selectedEvent.id);
                        setShowDetailsModal(false);
                      }
                    }}
                  >
                    {joiningEventId === selectedEvent.id ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Joining...
                      </div>
                    ) : selectedEvent.status === "full" ? (
                      "Event Full"
                    ) : !isUserLoggedIn ? (
                      "Login to Join"
                    ) : !isUserApproved ? (
                      "Approval Required"
                    ) : (
                      "Join Event"
                    )}
                  </Button>
                )}

                {/* Review Button - Only for past events */}
                {selectedEvent.isPastEvent &&
                  isUserLoggedIn &&
                  eventReviewStatus[selectedEvent.id]?.can_review && (
                    <Button
                      size="lg"
                      className="btn-share2care flex-1"
                      onClick={() => {
                        handleReviewEvent(selectedEvent);
                        setShowDetailsModal(false);
                      }}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Write Review
                    </Button>
                  )}

                {/* Already Reviewed Button */}
                {selectedEvent.isPastEvent &&
                  isUserLoggedIn &&
                  eventReviewStatus[selectedEvent.id]?.has_reviewed && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1 cursor-not-allowed"
                      disabled
                    >
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Reviewed
                    </Button>
                  )}

                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedEvent(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewingEvent && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
            <button
              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-xl"
              onClick={() => {
                setShowReviewModal(false);
                setReviewingEvent(null);
                setReviewRating(0);
                setReviewText("");
              }}
            >
              ×
            </button>

            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Review Event
                </h3>
                <p className="text-sm text-gray-600">
                  Share your experience with "{reviewingEvent.title}"
                </p>
              </div>

              {/* Rating Stars */}
              <div className="text-center">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Your Rating *
                </Label>
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl transition-colors ${
                        star <= reviewRating
                          ? "text-yellow-400 hover:text-yellow-500"
                          : "text-gray-300 hover:text-yellow-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {reviewRating === 0 && "Click to rate"}
                  {reviewRating === 1 && "Poor"}
                  {reviewRating === 2 && "Fair"}
                  {reviewRating === 3 && "Good"}
                  {reviewRating === 4 && "Very Good"}
                  {reviewRating === 5 && "Excellent"}
                </p>
              </div>

              {/* Review Text */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Your Review (Optional)
                </Label>
                <Textarea
                  placeholder="Share your thoughts about this event..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="min-h-[100px] resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reviewText.length}/1000 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewingEvent(null);
                    setReviewRating(0);
                    setReviewText("");
                  }}
                  disabled={isSubmittingReview}
                >
                  Cancel
                </Button>
                <Button
                  className="btn-share2care flex-1"
                  onClick={submitReview}
                  disabled={reviewRating === 0 || isSubmittingReview}
                >
                  {isSubmittingReview ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-1" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share2care Footer */}
      <Footer />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
