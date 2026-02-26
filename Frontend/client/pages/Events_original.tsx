import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
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
  Heart,
  ArrowLeft,
  Plus,
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  Filter,
  Search,
  UserCircle,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Menu,
  X,
  Goal,
  ListFilter,
  Loader2,
} from "lucide-react";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { FaFileAlt } from "react-icons/fa";
import { BsMicrosoft } from "react-icons/bs";
import apiService, { Event, Category } from "@/services/api";
import { toast } from "sonner";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export default function Events() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("current");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  
  // Debug showCreateEvent state changes
  useEffect(() => {
    console.log('showCreateEvent changed to:', showCreateEvent);
  }, [showCreateEvent]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [view, setView] = useState("list");

  // API state management
  const [currentEvents, setCurrentEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
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

  // Check if user is logged in and fetch data
  useEffect(() => {
    const userPhone = localStorage.getItem("userPhone");
    const userLoggedIn = localStorage.getItem("userLoggedIn");
    const userToken = localStorage.getItem("userToken");
    const isLoggedIn = !!(userPhone && userLoggedIn && userToken);
    
    console.log('Auth check:', { userPhone, userLoggedIn, userToken, isLoggedIn });
    setIsUserLoggedIn(isLoggedIn);
    
    // Fetch initial data
    fetchEvents();
    fetchCategories();
    
    // Check if create parameter is present
    if (searchParams.get('create') === 'true') {
      console.log('Create parameter found');
      if (isLoggedIn) {
        console.log('User is logged in, opening create modal');
        setShowCreateEvent(true);
        // Remove the parameter from URL
        setSearchParams({});
      } else {
        console.log('User not logged in, redirecting to login');
        // Redirect to login if not logged in
        navigate('/user');
      }
    }
  }, [searchParams, navigate, setSearchParams]);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      // For now, we'll use the public getActive endpoint
      // Later we can add user-specific events
      const response = await fetch(`${API_BASE_URL}/events/getActive`);
      const data = await response.json();
      
      if (data.success && data.data) {
        // Separate current and past events
        const now = new Date();
        const current = data.data.filter((event: Event) => 
          new Date(event.event_date) >= now && event.status === 'active'
        );
        const past = data.data.filter((event: Event) => 
          new Date(event.event_date) < now || event.status === 'completed'
        );
        
        setCurrentEvents(current);
        setPastEvents(past);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/getActive`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to hardcoded categories if API fails
    }
  };

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("community");
  const [contactInfo, setContactInfo] = useState("");
  // Handle join event with authentication check
  // Join handler
  const handleJoinEvent = (eventId) => {
    if (!isUserLoggedIn) {
      navigate("/user");
      return;
    }
    setCurrentEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              joinedGuests: ev.joinedGuests + 1,
              status: ev.joinedGuests + 1 >= ev.maxGuests ? "full" : ev.status,
            }
          : ev,
      ),
    );
    // Handle join event logic here
    alert(
      `Joining event ${eventId} - this would be implemented with backend API`,
    );
  };

  // Handle create event with authentication check
  const handleCreateEvent = () => {
    console.log('Create event clicked, isUserLoggedIn:', isUserLoggedIn);
    if (!isUserLoggedIn) {
      navigate("/user");
      return;
    }
    console.log('Opening create event modal');
    setShowCreateEvent(true);
  };

  const handleSubmitNewEvent = async () => {
    if (!isUserLoggedIn) {
      toast.error('Please login to create an event');
      navigate('/user');
      return;
    }

    // Validation
    if (!title || !category || !date || !startTime || !endTime || !location || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(date) < new Date()) {
      toast.error('Event date cannot be in the past');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      setSubmitLoading(true);
      
      // Get user info from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;
      
      if (!userId) {
        toast.error('User information not found. Please login again.');
        navigate('/user');
        return;
      }

      // Find category ID
      const selectedCategory = categories.find(cat => cat.name === category);
      const categoryId = selectedCategory ? selectedCategory.id : 1; // Default to first category

      const eventData = {
        title,
        description,
        category_id: categoryId,
        location,
        event_date: date,
        start_time: startTime, // Already in HH:MM format from input
        end_time: endTime,     // Already in HH:MM format from input
        max_participants: maxGuests,
        organizer_id: userId,
        status: 'active',
        event_type: eventType,
        contact_info: contactInfo || user.email || '',
        is_featured: false,
      };

      const response = await apiService.createUserEvent(eventData);
      
      if (response) {
        toast.success('Event created successfully!');
        setShowCreateEvent(false);
        resetForm();
        fetchEvents(); // Refresh events list
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setMaxGuests(1);
    setDescription("");
    setEventType("community");
    setContactInfo("");
  };
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

  const skillSets = [
    "Artistic activities",
    "Community/Social service",
    "Cooking or baking",
    "Healthcare",
    "Playing a musical instrument",
    "Games/Sports",
    "Outdoor games",
    "Cycling/Swimming",
    "Photography",
    "Blog Writing",
    "Religious Discussions",
    "Political discussions",
    "Exploring Culture",
    "Dancing",
    "Charity",
    "Stand-up Comedy",
    "Journalism",
    "Gardening",
    "Farming",
    "Calligraphy",
    "Yoga and Nature Cure",
    "Quiz, Crossword puzzles",
    "Antakshari, Tambola",
    "Meditation, Wellness",
    "Devotional Discussions",
    "Indian Festivals, Songs",
    "Mindful Morning",
  ];

  const currentEventsData = [
    {
      id: "EVT001",
      title: "Morning Yoga & Meditation",
      category: "Yoga and Nature Cure",
      date: "2024-12-28",
      time: "07:00 AM",
      location: "CP, Delhi",
      host: "Mrs. Sunita Sharma",
      maxGuests: 4,
      joinedGuests: 2,
      description:
        "Join us for a peaceful morning yoga session followed by guided meditation. Perfect for beginners and experienced practitioners.",
      status: "active",
    },
    {
      id: "EVT002",
      title: "Chess Tournament",
      category: "Games/Sports",
      date: "2024-12-29",
      time: "02:00 PM",
      location: "Lajpat Nagar, Delhi",
      host: "Mr. Rajesh Kumar",
      maxGuests: 6,
      joinedGuests: 4,
      description:
        "Friendly chess matches for all skill levels. We'll have multiple rounds and prizes for winners.",
      status: "active",
    },
    {
      id: "EVT003",
      title: "Cooking Workshop - Traditional Sweets",
      category: "Cooking or baking",
      date: "2024-12-30",
      time: "10:00 AM",
      location: "Vasant Kunj, Delhi",
      host: "Mrs. Priya Gupta",
      maxGuests: 3,
      joinedGuests: 3,
      description:
        "Learn to make traditional Indian sweets. All ingredients provided. Perfect for festival season!",
      status: "full",
    },
    {
      id: "EVT004",
      title: "Evening Music Circle",
      category: "Playing a musical instrument",
      date: "2024-12-31",
      time: "05:00 PM",
      location: "Dwarka, Delhi",
      host: "Mr. Ashok Verma",
      maxGuests: 5,
      joinedGuests: 2,
      description:
        "Bring your instruments or just enjoy listening to music. A relaxing evening with fellow music lovers.",
      status: "active",
    },
    {
      id: "EVT005",
      title: "Gardening Tips & Tea",
      category: "Gardening",
      date: "2025-01-02",
      time: "04:00 PM",
      location: "Vasant Vihar, Delhi",
      host: "Mrs. Meera Joshi",
      maxGuests: 4,
      joinedGuests: 1,
      description:
        "Share gardening experiences over tea. Learn about seasonal plants and eco-friendly practices.",
      status: "active",
    },
    {
      id: "EVT006",
      title: "Book Discussion Club",
      category: "Blog Writing",
      date: "2025-01-03",
      time: "03:00 PM",
      location: "Karol Bagh, Delhi",
      host: "Mrs. Kavita Singh",
      maxGuests: 6,
      joinedGuests: 4,
      description:
        "Discuss your favorite books and discover new authors. This month: Contemporary Indian literature.",
      status: "active",
    },
  ];

  const pastEventsData = [
    {
      id: "EVT101",
      title: "Book Reading Club",
      category: "Blog Writing",
      date: "2024-12-20",
      time: "03:00 PM",
      location: "Karol Bagh, Delhi",
      host: "Mrs. Meera Joshi",
      rating: 5,
      feedback: "Wonderful discussion on contemporary literature",
      status: "completed",
    },
    {
      id: "EVT102",
      title: "Photography Walk",
      category: "Photography",
      date: "2024-12-18",
      time: "06:30 AM",
      location: "India Gate, Delhi",
      host: "Mr. Vikram Mehta",
      rating: 4,
      feedback: "Great learning experience with excellent guidance",
      status: "completed",
    },
    {
      id: "EVT103",
      title: "Cooking Session - North Indian",
      category: "Cooking or baking",
      date: "2024-12-15",
      time: "10:00 AM",
      location: "Lajpat Nagar, Delhi",
      host: "Mrs. Sunita Sharma",
      rating: 5,
      feedback: "Amazing recipes and very friendly host",
      status: "completed",
    },
  ];

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
              // value={searchTerm}
              // onChange={(e) => setSearchTerm(e.target.value)}
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
              {skillSets.map((skill, index) => (
                <SelectItem key={skill} value={`filter-skill-${index}`}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="flex flex-col space-y-2 min-w-[180px]">
          <Label className="text-sm font-semibold text-gray-700">
            Location
          </Label>
          <Select>
            <SelectTrigger className="border-gray-300 focus:border-share2care-red">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-locations">All Locations</SelectItem>
              <SelectItem value="delhi">Delhi</SelectItem>
              <SelectItem value="mumbai">Mumbai</SelectItem>
              <SelectItem value="bangalore">Bangalore</SelectItem>
              <SelectItem value="chennai">Chennai</SelectItem>
              <SelectItem value="kolkata">Kolkata</SelectItem>
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
            {event.event_date ? new Date(event.event_date).toLocaleDateString() : event.date}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            {event.start_time ? new Date(event.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : event.time}
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {event.location}
          </div>
          <div className="flex items-center text-gray-600">
            <UserCircle className="w-4 h-4 mr-2" />
            Host: {event.organizer || event.host}
          </div>
        </div>

        {(event.max_participants || event.maxGuests) && (
          <div className="flex items-center text-gray-600 text-sm">
            <Users className="w-4 h-4 mr-2" />
            {event.current_participants || event.joinedGuests || 0}/{event.max_participants || event.maxGuests} joined
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

        {showActions && event.status !== "completed" && (
          <div className="flex gap-2 pt-2">
          
    
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    if (isUserLoggedIn) {
                      setSelectedEvent(event);
                      setShowDetailsModal(true);
                    } else {
                      alert("Please login to view event details");
                    }
                  }}
                >
                  View Details
                </Button>
                {/* DETAILS MODAL */}
                {showDetailsModal && selectedEvent && (
                  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
                      <button
                        className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-xl"
                        onClick={() => setShowDetailsModal(false)}
                      >
                        ×
                      </button>

                      <div className="space-y-4">
                        <div className="text-left">
                          <h4 className="font-medium mb-1">
                            {" "}
                            Event details and host information
                          </h4>
                          <p className="text-sm text-gray-600">
                            {selectedEvent.title} at {selectedEvent.title}
                          </p>
                        </div>
                        <div className=" grid grid-cols-2 gap-4">
                          <div className="text-left">
                            <h4 className="font-medium mb-1">Date & Time</h4>
                            <p className="text-sm text-gray-600">
                              {selectedEvent.date} at {selectedEvent.time}
                            </p>
                          </div>
                          <div className="text-left">
                            <h4 className="font-medium mb-1">Location</h4>
                            <p className="text-sm text-gray-600">
                              {selectedEvent.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium mb-1">Description</h4>
                          <p className="text-sm text-gray-600">
                            {selectedEvent.description}
                          </p>
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium mb-1">Host Details</h4>
                          <p className="text-sm text-gray-600">
                            {selectedEvent.host}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-between">
                        <button
                          className="px-4 py-2 bg-share2care-red text-white rounded hover:bg-red-600"
                          onClick={() => setShowDetailsModal(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            
            <Button
              size="sm"
              disabled={event.status === "full"}
              className="btn-share2care flex-1"
              onClick={() => handleJoinEvent(event.id)}
            >
              {event.status === "full"
                ? "Event Full"
                : isUserLoggedIn
                  ? "Join Event"
                  : "Login to Join"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Component */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section */}
        <section className="relative mt-32 py-12 px-6 bg-gradient-to-br from-red-50 to-yellow-50 rounded-3xl mb-12">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="mb-6 px-6 py-3 text-lg font-medium border-2 rounded-full  border-share2care-red text-share2care-red hover:bg-share2care-red hover:text-white transition-all duration-300"
            >
              <Goal className="mr-2" /> Community Events
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Events <span className="share2care-primary-text">Portal</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Discover and join meaningful activities in your community. Connect
              with fellow elders, share experiences, and create lasting
              friendships through engaging events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {isUserLoggedIn ? (
                <Link to="/user-dashboard">
                  <Button
                    size="lg"
                    className="btn-share2care px-8 py-4 text-lg w-full sm:w-auto"
                  >
                    <UserCircle className="w-5 h-5 mr-2" />
                    My Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/user">
                  <Button
                    size="lg"
                    className="btn-share2care px-8 py-4 text-lg w-full sm:w-auto"
                  >
                    <UserCircle className="w-5 h-5 mr-2" />
                    Join to Participate
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                size="lg"
                className="btn-share2care-outline px-6 py-2 border-2 border-share2care-red text-share2care-red hover:bg-share2care-red hover:text-white transition-all duration-300"
                onClick={handleCreateEvent}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="text-2xl font-bold share2care-primary-text cursor-pointer">
                  6
                </div>
                <p className="text-sm text-gray-600">Active Events</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="text-2xl font-bold share2care-primary-text cursor-pointer">
                  27
                </div>
                <p className="text-sm text-gray-600">Categories</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="text-2xl font-bold share2care-primary-text cursor-pointer">
                  50+
                </div>
                <p className="text-sm text-gray-600">Cities</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="text-2xl font-bold share2care-primary-text cursor-pointer">
                  100%
                </div>
                <p className="text-sm text-gray-600">Free to Join</p>
              </div>
            </div>
          </div>
        </section>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Upcoming Events
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
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
              <Button
                className="btn-share2care text-sm flex-1 sm:flex-none"
                onClick={handleCreateEvent}
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Create Event</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>

            {/* Create Event Dialog */}
            <Dialog open={showCreateEvent} onOpenChange={(open) => {
              console.log('Dialog onOpenChange:', open);
              setShowCreateEvent(open);
            }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                      Create a new time-sharing event for the community.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Form fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-title">Event Title *</Label>
                        <Input
                          id="event-title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter event title"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category/Skill Set *</Label>
                        <Select onValueChange={setCategory} value={category}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.length > 0 ? (
                              categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>
                                  {cat.name}
                                </SelectItem>
                              ))
                            ) : (
                              skillSets.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-date">Date *</Label>
                        <Input
                          id="event-date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-type">Event Type</Label>
                        <Select onValueChange={setEventType} value={eventType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="community">Community</SelectItem>
                            <SelectItem value="charity">Charity</SelectItem>
                            <SelectItem value="volunteer">Volunteer</SelectItem>
                            <SelectItem value="fundraising">Fundraising</SelectItem>
                            <SelectItem value="awareness">Awareness</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-time">Start Time *</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-time">End Time *</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-guests">Max Participants *</Label>
                        <Input
                          id="max-guests"
                          type="number"
                          value={maxGuests}
                          onChange={(e) => setMaxGuests(Number(e.target.value))}
                          min={1}
                          max={50}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-location">Location *</Label>
                        <Input
                          id="event-location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Enter location (e.g., CP, Delhi)"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-info">Contact Info</Label>
                        <Input
                          id="contact-info"
                          value={contactInfo}
                          onChange={(e) => setContactInfo(e.target.value)}
                          placeholder="Phone or email (optional)"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-description">Description *</Label>
                      <Textarea
                        id="event-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Describe your event, what participants can expect..."
                        required
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        onClick={handleSubmitNewEvent}
                        disabled={submitLoading}
                        className="min-w-[120px]"
                      >
                        {submitLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Event'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCreateEvent(false);
                          resetForm();
                        }}
                        disabled={submitLoading}
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
          <div className="flex gap-6">
            {/* Main Content */}
            <div className="flex-1 mt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
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
                <TabsContent value="current" className=" space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-gray-600 text-sm">
                      {isUserLoggedIn
                        ? "Join events or create your own!"
                        : "Login to join events and interact with the community"}
                    </p>
                  </div>
                  {/*Active Events Cards*/}
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-share2care-red" />
                      <span className="ml-2 text-gray-600">Loading events...</span>
                    </div>
                  ) : view === "grid" ? (
                    <div className="space-y-4">
                      {currentEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          handleJoinEvent={handleJoinEvent}
                          isUserLoggedIn={isUserLoggedIn}
                          showActions={true}
                        />
                      ))}
                      {currentEventsData.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          handleJoinEvent={handleJoinEvent}
                          isUserLoggedIn={isUserLoggedIn}
                          showActions={true}
                        />
                      ))}
                      {currentEvents.length === 0 && currentEventsData.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No active events found.</p>
                          {isUserLoggedIn && (
                            <p className="text-sm text-gray-400 mt-2">Be the first to create an event!</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto relative">
                      {/*Active Events Table List*/}
                      <table className="min-w-full border border-gray-200 text-sm text-left">
                        <thead className="bg-gray-100 text-gray-700">
                          <tr>
                            <th className="px-4 py-2 border">Event Name</th>
                            <th className="px-4 py-2 border">Place</th>
                            <th className="px-4 py-2 border">Date</th>
                            <th className="px-4 py-2 border text-center">
                              View Details
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {[...currentEvents, ...currentEventsData].map(
                            (event) => (
                              <tr
                                key={event.id}
                                className="odd:bg-white even:bg-gray-50 hover:bg-gray-100"
                              >
                                <td className="px-4 py-2 border">
                                  {event.title}
                                </td>
                                <td className="px-4 py-2 border">
                                  {event.location}
                                </td>
                                <td className="px-4 py-2 border">
                                  {event.event_date ? new Date(event.event_date).toLocaleDateString("en-GB") : new Date(event.date).toLocaleDateString("en-GB")}
                                </td>
                                <td className="px-4 py-2 border text-center">
                                  <button
                                    onClick={() => {
                                      if (isUserLoggedIn) {
                                        setSelectedEvent(event);
                                        setShowDetailsModal(true);
                                      } else {
                                        alert(
                                          "Please login to view event details",
                                        );
                                      }
                                    }}
                                    title="View Details"
                                    className="hover:[#700e12] text-lg underline"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ),
                          )}

                          {/* No Events Fallback */}
                          {[...currentEvents, ...currentEventsData].length ===
                            0 && (
                            <tr>
                              <td
                                colSpan="4"
                                className="text-center text-gray-500 py-4 border"
                              >
                                No upcoming events found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {/* DETAILS MODAL */}
                      {showDetailsModal && selectedEvent && (
                        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
                            <button
                              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-xl"
                              onClick={() => setShowDetailsModal(false)}
                            >
                              ×
                            </button>

                            <div className="space-y-4">
                              <div className="text-left">
                                <h4 className="font-medium mb-1">
                             
                                  Event details and host information
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {selectedEvent.title} at {selectedEvent.title}
                                </p>
                              </div>
                              <div className=" grid grid-cols-2 gap-4">
                                <div className="text-left">
                                  <h4 className="font-medium mb-1">
                                    Date & Time
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {selectedEvent.date} at {selectedEvent.time}
                                  </p>
                                </div>
                                <div className="text-left">
                                  <h4 className="font-medium mb-1">Location</h4>
                                  <p className="text-sm text-gray-600">
                                    {selectedEvent.location}
                                  </p>
                                </div>
                              </div>
                              <div className="text-left">
                                <h4 className="font-medium mb-1">
                                  Description
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {selectedEvent.description}
                                </p>
                              </div>
                              <div className="text-left">
                                <h4 className="font-medium mb-1">
                                  Host Details
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {selectedEvent.host}
                                </p>
                              </div>
                            </div>

                            <div className="mt-6 flex justify-between">
                              <Button
                                size="sm"
                                disabled={event.status === "full"}
                                className=""
                                onClick={() => handleJoinEvent(event.id)}
                              >
                                {event.status === "full"
                                  ? "Event Full"
                                  : isUserLoggedIn
                                    ? "Join Event"
                                    : "Login to Join"}
                              </Button>
                              <button
                                className="px-4 py-2 bg-share2care-red text-white rounded hover:bg-red-600"
                                onClick={() => setShowDetailsModal(false)}
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Login Prompt */}
                  {!isUserLoggedIn && (
                    <p className="text-center font-medium text-sm text-gray-700 mt-4">
                      Login to see details of events
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
                  {/*Past Events Cards*/}
                  {view === "grid" ? (
                    <div className="space-y-4">
                      {pastEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          showActions={false}
                          handleJoinEvent={handleJoinEvent}
                          isUserLoggedIn={isUserLoggedIn}
                        />
                      ))}
                      {pastEventsData.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          showActions={false}
                          handleJoinEvent={handleJoinEvent}
                          isUserLoggedIn={isUserLoggedIn}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto relative">
                      {/*past Events Table List*/}
                      <table className="min-w-full border border-gray-200 text-sm text-left">
                        <thead className="bg-gray-100 text-gray-700">
                          <tr>
                            <th className="px-4 py-2 border">Event Name</th>
                            <th className="px-4 py-2 border">Place</th>
                            <th className="px-4 py-2 border">Date</th>
                            <th className="px-4 py-2 border text-center">
                              View Details
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {[...pastEvents, ...pastEventsData].map((event) => (
                            <tr
                              key={event.id}
                              className="odd:bg-white even:bg-gray-50 hover:bg-gray-100"
                            >
                              <td className="px-4 py-2 border">
                                {event.title}
                              </td>
                              <td className="px-4 py-2 border">
                                {event.location}
                              </td>
                              <td className="px-4 py-2 border">
                                {new Date(event.date).toLocaleDateString(
                                  "en-GB",
                                )}
                              </td>
                              <td className="px-4 py-2 border text-center">
                                <button
                                  onClick={() => {
                                    if (isUserLoggedIn) {
                                      setSelectedEvent(event);
                                      setShowDetailsModal(true);
                                    } else {
                                      alert(
                                        "Please login to view event details",
                                      );
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
                          {[...currentEvents, ...currentEventsData].length ===
                            0 && (
                            <tr>
                              <td
                                colSpan="4"
                                className="text-center text-gray-500 py-4 border"
                              >
                                No upcoming events found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {/* DETAILS MODAL */}
                      {showDetailsModal && selectedEvent && (
                        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
                            <button
                              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-xl"
                              onClick={() => setShowDetailsModal(false)}
                            >
                              ×
                            </button>

                            <h2 className="text-xl font-bold text-green-600 mb-2">
                              {selectedEvent.name}
                            </h2>
                            <p className="mb-1">
                              <strong>Place:</strong> {selectedEvent.location}
                            </p>
                            <p className="mb-1">
                              <strong>Date:</strong>{" "}
                              {new Date(selectedEvent.date).toLocaleDateString(
                                "en-GB",
                              )}
                            </p>
                            <p className="mt-4 text-gray-700 text-sm">
                              <strong>Description:</strong>{" "}
                              {selectedEvent.description ||
                                "No description provided."}
                            </p>

                            <div className="mt-6 flex justify-end">
                              <button
                                className="px-4 py-2 bg-share2care-red text-white rounded hover:bg-red-600"
                                onClick={() => setShowDetailsModal(false)}
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Login Prompt */}
                  {!isUserLoggedIn && (
                    <p className="text-center font-medium text-sm text-gray-700 mt-4">
                      Login to see details of events
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

      {/* Share2care Footer */}
      <Footer />
    </div>
  );
}
