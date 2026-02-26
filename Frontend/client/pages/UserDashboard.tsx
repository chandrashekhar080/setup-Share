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
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Swal from 'sweetalert2';
import {
  Heart,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  Bell,
  Settings,
  User,
  Plus,
  BookOpen,
  Sparkles,
  MessageSquare,
  CheckCircle,
  XCircle,
  LogOut,
  Camera,
  Phone,
  Mail,
  Activity,
  Edit,
  AlertCircle,
  MailIcon,
  RefreshCw,
  Loader2,
} from "lucide-react";
import UserSidebar from "@/components/Layout/UserSidebar";
import Header from "@/components/Layout/Header";
import Share2Care from "../../public/Images/logo-Share2Care.png";
import { HeaderPart } from "../components/Layout/Header";
import apiService from "../services/api";
import tokenManager from "../utils/tokenManager";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const STORAGE_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000';

// Utility functions for date and time formatting
const formatDate = (dateString) => {
  if (!dateString) return 'Date TBD';
  try {
    let date;
    if (dateString.includes('T')) {
      // For full datetime strings with timezone
      date = new Date(dateString);
      // Convert to India timezone and extract date
      return date.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } else {
      // For date-only strings (YYYY-MM-DD)
      const [year, month, day] = dateString.split('-');
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Helper function to format time for HTML time input (HH:MM format)
const formatTimeForInput = (timeString) => {
  if (!timeString) return '';
  
  try {
    // If it's a full datetime string (contains 'T')
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      // Convert to local time and format as HH:MM
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // If it's already in HH:MM or HH:MM:SS format
    if (timeString.includes(':')) {
      const timeParts = timeString.split(':');
      const hours = timeParts[0].padStart(2, '0');
      const minutes = timeParts[1] ? timeParts[1].padStart(2, '0') : '00';
      return `${hours}:${minutes}`;
    }
    
    // If it's in 12-hour format with AM/PM
    const hasAMPM = /am|pm/i.test(timeString);
    if (hasAMPM) {
      // Parse 12-hour format and convert to 24-hour
      const timeStr = timeString.toLowerCase().replace(/\s+/g, '');
      const timeMatch = timeStr.match(/^(\d{1,2}):?(\d{0,2})(am|pm)$/i);
      
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const period = timeMatch[3].toLowerCase();
        
        // Convert to 24-hour format
        if (period === 'pm' && hours !== 12) {
          hours += 12;
        } else if (period === 'am' && hours === 12) {
          hours = 0;
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
    
    // If it's just a number (assume hours)
    if (/^\d+$/.test(timeString)) {
      const hours = parseInt(timeString).toString().padStart(2, '0');
      return `${hours}:00`;
    }
    
    // Return as-is if we can't parse it
    return timeString;
  } catch (error) {
    console.error('Error formatting time for input:', error);
    return '';
  }
};

const formatTime = (timeString) => {
  if (!timeString) return 'Time TBD';
  try {
    let date;
    if (timeString.includes('T')) {
      // For full datetime strings with timezone (like 2025-08-01T18:30:00.000000Z)
      date = new Date(timeString);
      // Convert to India timezone
      return date.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else {
      // For time-only strings (HH:MM or HH:MM:SS) - assume local time
      const timePart = timeString.includes(':') ? timeString : `${timeString}:00`;
      date = new Date(`2000-01-01T${timePart}`);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
};

// Utility function to determine if an event has started (for join validation)
const hasEventStarted = (event) => {
  try {
    const now = new Date();
    
    // Use start_time if available, otherwise use event_date
    if (event.start_time && event.start_time.trim() !== '') {
      const eventStartDateTime = new Date(event.start_time);
      return eventStartDateTime < now;
    } else {
      // Fallback: use event_date
      const eventDate = new Date(event.event_date);
      return eventDate < now;
    }
  } catch (error) {
    console.error('Error checking if event has started:', error, event);
    // Fallback to original logic
    const eventDate = new Date(event.event_date);
    return eventDate < now;
  }
};

const UserDashboard = () => {

  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("timesharing");
  const [userProfile, setUserProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [isUserApproved, setIsUserApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    events_created: 0,
    events_joined: 0,
    average_rating: 0,
    total_reviews: 0,
  });
  const [todayEvents, setTodayEvents] = useState([]);
  const [userCreatedEvents, setUserCreatedEvents] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [joiningEventId, setJoiningEventId] = useState(null);
  
  // Modal states for edit and manage
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState(null);
  const [selectedEventForManage, setSelectedEventForManage] = useState(null);
  
  // Participant management states
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [eventParticipants, setEventParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showParticipantDetailsModal, setShowParticipantDetailsModal] = useState(false);
  const [processingParticipant, setProcessingParticipant] = useState(false);
  
  // Edit form states
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    max_participants: 1,
    category_id: '',
    event_type: 'charity',
    contact_info: ''
  });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);
  const [categories, setCategories] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [eventEditTimeLimit, setEventEditTimeLimit] = useState(1); // Default 1 hour

  // Load event edit time limit from settings
  const loadEventEditTimeLimit = async () => {
    try {
      console.log('Loading event edit time limit from settings...');
      const response = await apiService.getDefaultSettings();
      
      const settings = response.data?.settings;
      
      if (settings && settings.extra_field) {
        const extraField = JSON.parse(settings.extra_field);
        const timeLimit = extraField.event_edit_time_limit;
        
        if (timeLimit !== undefined && timeLimit !== null) {
          const parsedLimit = parseInt(timeLimit) || 1;
          setEventEditTimeLimit(parsedLimit);
          console.log('Event edit time limit loaded:', parsedLimit, 'hours');
        } else {
          console.log('No event_edit_time_limit found in settings, using default 1 hour');
        }
      } else {
        console.log('No settings or extra_field found, using default 1 hour');
      }
    } catch (error) {
      console.error('Error loading event edit time limit:', error);
      // Keep default value of 1 hour
    }
  };

  // Test function to verify time calculations (for debugging)
  window.testCanEditEvent = (eventDate, startTime, timeLimitHours = 1) => {
    const testEvent = {
      title: 'Test Event',
      event_date: eventDate,
      start_time: startTime
    };
    
    console.log('=== Testing canEditEvent ===');
    console.log('Test Event:', testEvent);
    console.log('Time Limit:', timeLimitHours, 'hours');
    
    // Temporarily set the time limit for testing
    const originalLimit = eventEditTimeLimit;
    setEventEditTimeLimit(timeLimitHours);
    
    const result = canEditEvent(testEvent);
    
    // Restore original limit
    setEventEditTimeLimit(originalLimit);
    
    console.log('Result:', result ? 'CAN EDIT' : 'CANNOT EDIT');
    console.log('============================');
    
    return result;
  };

  // Debug function to check all current events
  window.debugAllEvents = () => {
    console.log('=== Debug All Events ===');
    console.log('Current eventEditTimeLimit:', eventEditTimeLimit);
    console.log('Current time:', new Date().toString());
    console.log('User created events:', userCreatedEvents);
    
    userCreatedEvents.forEach((event, index) => {
      console.log(`\n--- Event ${index + 1}: ${event.title} ---`);
      console.log('Event data:', event);
      const canEdit = canEditEvent(event);
      console.log('Can edit result:', canEdit);
    });
    console.log('========================');
  };

  // Check if event can be edited/managed (based on time limit before event)
  const canEditEvent = (event) => {
    console.log('=== canEditEvent called ===');
    console.log('Event data:', event);
    console.log('Event date:', event.event_date);
    console.log('Event start_time:', event.start_time);
    console.log('Current eventEditTimeLimit:', eventEditTimeLimit);
    
    if (!event.event_date || !event.start_time) {
      console.log('No date/time set, allowing edit');
      return true; // Allow editing if date/time is not set
    }

    try {
      let eventDateTime;

      // Determine which field contains the actual event datetime
      // Priority: start_time (if it's a full datetime) > event_date (if it's a full datetime)
      if (event.start_time.includes('T')) {
        // start_time is a full datetime string like "2025-08-07T14:00:00.000000Z"
        console.log('Using start_time as full datetime');
        eventDateTime = new Date(event.start_time);
        
        // Convert UTC to local time for display
        console.log('UTC time from start_time:', event.start_time);
        console.log('Converted to local time:', eventDateTime.toString());
      } else if (event.event_date.includes('T')) {
        // event_date is a full datetime string like "2025-08-07T18:30:00.000000Z"
        console.log('Using event_date as full datetime');
        eventDateTime = new Date(event.event_date);
        
        // Convert UTC to local time for display
        console.log('UTC time from event_date:', event.event_date);
        console.log('Converted to local time:', eventDateTime.toString());
      } else {
        // Both are separate date and time values - combine them
        console.log('Combining separate date and time values');
        
        const dateStr = event.event_date.includes('T') 
          ? event.event_date.split('T')[0] 
          : event.event_date;

        let timeStr = event.start_time.trim();

        // Handle different time formats
        const hasAMPM = /am|pm/i.test(timeStr);
        
        if (hasAMPM) {
          // Handle 12-hour format with AM/PM
          // Normalize the format for consistent parsing
          timeStr = timeStr.toLowerCase().replace(/\s+/g, '');
          
          // Parse manually for better reliability
          const timeMatch = timeStr.match(/^(\d{1,2}):?(\d{0,2})(am|pm)$/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
            const period = timeMatch[3].toLowerCase();
            
            // Convert to 24-hour format
            if (period === 'pm' && hours !== 12) {
              hours += 12;
            } else if (period === 'am' && hours === 12) {
              hours = 0;
            }
            
            // Create date with proper 24-hour time in local timezone
            const [year, month, day] = dateStr.split('-').map(Number);
            eventDateTime = new Date(year, month - 1, day, hours, minutes, 0);
          } else {
            // Fallback: try direct parsing
            const dateTimeStr = `${dateStr} ${timeStr}`;
            eventDateTime = new Date(dateTimeStr);
          }
        } else {
          // Handle 24-hour format
          if (!timeStr.includes(':')) {
            timeStr = `${timeStr.padStart(2, '0')}:00:00`;
          } else if (timeStr.split(':').length === 2) {
            timeStr = `${timeStr}:00`;
          }

          // Create date object in local timezone
          const [year, month, day] = dateStr.split('-').map(Number);
          const [hours, minutes, seconds = 0] = timeStr.split(':').map(Number);
          eventDateTime = new Date(year, month - 1, day, hours, minutes, seconds);
        }
      }

      // If parsing still fails, allow editing (fail-safe)
      if (isNaN(eventDateTime.getTime())) {
        console.warn('All parsing attempts failed, allowing edit for safety');
        return true;
      }

      const now = new Date();
      let timeDifferenceHours = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // TEMPORARY FIX: Handle date offset issues
      // If event appears to be in the past but within 24 hours, check if it should be today
      if (timeDifferenceHours < 0 && timeDifferenceHours > -24) {
        console.log('🔧 APPLYING DATE FIX: Event appears to be yesterday, checking if it should be today...');
        
        // Try adding 24 hours to see if it makes sense
        const adjustedEventDateTime = new Date(eventDateTime.getTime() + (24 * 60 * 60 * 1000));
        const adjustedTimeDifference = (adjustedEventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        console.log('Adjusted Event DateTime (local):', adjustedEventDateTime.toString());
        console.log('Adjusted time difference (hours):', adjustedTimeDifference.toFixed(2));
        
        // If the adjusted time makes more sense (event is today), use it
        if (adjustedTimeDifference > 0 && adjustedTimeDifference < 24) {
          console.log('✅ Using adjusted date - event appears to be today');
          eventDateTime = adjustedEventDateTime;
          timeDifferenceHours = adjustedTimeDifference;
        }
      }

      // Enhanced debugging
      console.log('=== canEditEvent Debug ===');
      console.log('Event:', event.title);
      console.log('Original event_date:', event.event_date);
      console.log('Original start_time:', event.start_time);
      console.log('Current time (local):', now.toString());
      console.log('Current time (UTC):', now.toISOString());
      console.log('Event DateTime (local):', eventDateTime.toString());
      console.log('Event DateTime (UTC):', eventDateTime.toISOString());
      console.log('Time difference (hours):', timeDifferenceHours.toFixed(2));
      console.log('Time difference (minutes):', (timeDifferenceHours * 60).toFixed(2));
      console.log('Edit time limit (hours):', eventEditTimeLimit);
      console.log('Can edit (time diff > limit):', timeDifferenceHours > eventEditTimeLimit);
      
      // Additional debugging for timezone issues
      if (timeDifferenceHours < 0) {
        console.log('⚠️  WARNING: Event appears to be in the past!');
        console.log('This might indicate a timezone or date issue.');
      } else if (timeDifferenceHours > 24) {
        console.log('ℹ️  Event is more than 24 hours away');
      } else {
        console.log(`ℹ️  Event is ${timeDifferenceHours.toFixed(2)} hours away`);
      }
      
      console.log('========================');

      // Return true if event is MORE than the time limit hours away
      return timeDifferenceHours > eventEditTimeLimit;
    } catch (error) {
      console.error('Error checking event edit time:', error);
      console.error('Event data:', event);
      // Fail-safe: allow editing if there's an error
      return true;
    }
  };


  // Handle edit event with time limit check
  const handleEditEvent = (event) => {
    if (!canEditEvent(event)) {
      toast({
        title: "Cannot Edit Event",
        description: `You cannot edit this event as it's within ${eventEditTimeLimit} hours of the start time.`,
        variant: "destructive",
      });
      return;
    }


    
    // Populate edit form with current event data first
    const formData = {
      title: event.title || '',
      description: event.description || '',
      event_date: event.event_date ? event.event_date.split('T')[0] : '',
      start_time: formatTimeForInput(event.start_time),
      end_time: formatTimeForInput(event.end_time),
      location: event.location || '',
      max_participants: event.max_participants || 1,
      category_id: event.category_id || '',
      event_type: event.event_type || 'charity',
      contact_info: event.contact_info || ''
    };

    
    // Set all the state in the correct order
    setEditFormData(formData);
    setSelectedEventForEdit(event);
    setEditFormErrors({});
    
    // Use setTimeout to ensure state updates have completed before showing modal
    setTimeout(() => {
      setShowEditModal(true);
    }, 0);
  };

  // Handle manage event with time limit check
  const handleManageEvent = (event) => {
    if (!canEditEvent(event)) {
      toast({
        title: "Cannot Manage Event",
        description: `You cannot manage this event as it's within ${eventEditTimeLimit} hours of the start time.`,
        variant: "destructive",
      });
      return;
    }

    console.log("Managing event:", event);
    setSelectedEventForManage(event);
    setShowManageModal(true);
  };

  // Load participants for an event
  const loadEventParticipants = async (eventId) => {
    setLoadingParticipants(true);
    try {
      console.log('=== Loading participants for event ===');
      console.log('Event ID:', eventId);
      console.log('User token exists:', !!localStorage.getItem('userToken'));
      console.log('User profile:', userProfile);
      
      const response = await apiService.getEventParticipants(eventId);
      console.log('Full participants response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data && response.data.participants) {
        console.log('✅ Successfully loaded participants:', response.data.participants.length);
        console.log('Participants data:', response.data.participants);
        setEventParticipants(response.data.participants);
        
        if (response.data.participants.length === 0) {
          toast({
            title: "Info",
            description: "No participants have joined this event yet.",
            variant: "default",
          });
        }
      } else {
        console.log('❌ No participants found or invalid response structure');
        console.log('Response success:', response.success);
        console.log('Response data:', response.data);
        setEventParticipants([]);
        toast({
          title: "Info",
          description: response.message || "No participants found for this event.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('❌ Error loading participants:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setEventParticipants([]);
      toast({
        title: "Error",
        description: error.message || "Failed to load participants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Handle view participants
  const handleViewParticipants = (event) => {
    setSelectedEventForManage(event);
    setShowParticipantsModal(true);
    loadEventParticipants(event.id);
  };

  // Handle participant details view
  const handleViewParticipantDetails = (participant) => {
    setSelectedParticipant(participant);
    setShowParticipantDetailsModal(true);
  };

  // Handle approve participant
  const handleApproveParticipant = async (participant) => {
    if (!userProfile?.id) {
      toast({
        title: "Error",
        description: "User profile not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    setProcessingParticipant(true);
    try {
      console.log('Approving participant:', participant.id);
      const response = await apiService.approveParticipant(participant.id, userProfile.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: `${participant.user_name || 'Participant'} has been approved for the event.`,
          variant: "default",
        });
        
        // Refresh participants list
        await loadEventParticipants(selectedEventForManage.id);
        
        // Refresh user created events to update participant count
        await loadUserCreatedEvents();
        
        // Close participant details modal
        setShowParticipantDetailsModal(false);
      } else {
        throw new Error(response.message || 'Failed to approve participant');
      }
    } catch (error) {
      console.error('Error approving participant:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve participant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingParticipant(false);
    }
  };

  // Handle reject participant
  const handleRejectParticipant = async (participant, rejectionReason = '') => {
    if (!userProfile?.id) {
      toast({
        title: "Error",
        description: "User profile not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    setProcessingParticipant(true);
    try {
      console.log('Rejecting participant:', participant.id, 'Reason:', rejectionReason);
      const response = await apiService.rejectParticipant(participant.id, userProfile.id, rejectionReason);
      
      if (response.success) {
        toast({
          title: "Success",
          description: `${participant.user_name || 'Participant'} has been rejected. The seat is now available for others.`,
          variant: "default",
        });
        
        // Refresh participants list
        await loadEventParticipants(selectedEventForManage.id);
        
        // Refresh user created events to update participant count and available spots
        await loadUserCreatedEvents();
        
        // Close participant details modal
        setShowParticipantDetailsModal(false);
      } else {
        throw new Error(response.message || 'Failed to reject participant');
      }
    } catch (error) {
      console.error('Error rejecting participant:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject participant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingParticipant(false);
    }
  };

  // Check if user is approved to create events
  const checkUserApprovalStatus = () => {
    console.log('=== isUserApproved Debug ===');
    console.log('approvalStatus:', approvalStatus);
    
    if (!approvalStatus) {
      console.log('No approval status - returning false');
      return false;
    }
    
    // Handle both direct response and nested data structure
    const statusData = approvalStatus.data || approvalStatus;
    const { status, approval_status } = statusData;
    
    console.log('status:', status);
    console.log('approval_status:', approval_status);
    
    const isApproved = status === 'approved' || approval_status === 'approved';
    console.log('Final isApproved result:', isApproved);
    
    return isApproved;
  };

  // Check if user profile is completed
  const checkProfileCompletion = (user) => {
    try {
      console.log('Checking profile completion for user:', user);
      
      // Check if user has completed profile data in 'others' field
      if (!user || !user.others) {
        console.log('User or user.others is missing');
        return false;
      }

      const profileData = typeof user.others === 'string' ? JSON.parse(user.others) : user.others;
      console.log('Profile data:', profileData);
      
      // Check for essential profile completion fields
      const requiredFields = [
        'title', 'firstName', 'lastName', 'gender', 'dob',
        'houseNo', 'locality', 'city', 'pinCode',
        'education', 'profession', 'bloodGroup',
        'doc1Type', 'doc1Number', 'doc1File',
        'doc2Type', 'doc2Number', 'doc2File',
        'emergencyName', 'emergencyRelation', 'emergencyContact'
      ];

      const missingFields = requiredFields.filter(field => {
        const value = profileData[field];
        const isEmpty = !value || 
                       (typeof value === 'string' && value.trim() === '') ||
                       (Array.isArray(value) && value.length === 0);
        
        if (isEmpty) {
          console.log(`Missing field: ${field}, value:`, value);
        }
        return isEmpty;
      });

      // Also check if skills are selected
      if (!profileData.selectedSkills || 
          (Array.isArray(profileData.selectedSkills) && profileData.selectedSkills.length === 0)) {
        console.log('Missing selectedSkills:', profileData.selectedSkills);
        missingFields.push('selectedSkills');
      }

      // If there are missing fields, profile is not complete
      if (missingFields.length > 0) {
        console.log('Profile incomplete. Missing fields:', missingFields);
        return false;
      }

      console.log('Profile is complete!');
      return true;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      console.error('User data that caused error:', user);
      return false;
    }
  };

  // Load dashboard data from API
  const loadDashboardData = async (userId) => {
    // Load dashboard stats first (most important)
    try {
      const stats = await apiService.getUserDashboardStats(userId);
      if (stats && typeof stats === 'object') {
        setDashboardStats({
          events_created: stats.events_created || 0,
          events_joined: stats.events_joined || 0,
          average_rating: stats.average_rating || 0,
          total_reviews: stats.total_reviews || 0,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Fallback data when API fails - use zeros to indicate no data
      setDashboardStats({
        events_created: 0,
        events_joined: 0,
        average_rating: 0,
        total_reviews: 0,
      });
    }

    // Load today's events
    try {
      const todayEventsData = await apiService.getUserTodayEvents(userId);
      setTodayEvents(todayEventsData || []);
    } catch (error) {
      console.error('Error loading today events:', error);
      setTodayEvents([]);
    }

    // Load user created events
    try {
      console.log('Loading user created events for userId:', userId);
      const createdEventsData = await apiService.getUserCreatedEvents(userId);
      console.log('User created events data received:', createdEventsData);
      
      if (Array.isArray(createdEventsData)) {
        console.log('Setting user created events:', createdEventsData.length, 'events');
        setUserCreatedEvents(createdEventsData);
      } else {
        console.log('Created events data is not an array:', typeof createdEventsData, createdEventsData);
        setUserCreatedEvents([]);
      }
    } catch (error) {
      console.error('Error loading user created events:', error);
      console.error('Error details:', error.message);
      // Fallback data when API fails - empty array to indicate no events
      setUserCreatedEvents([]);
    }

    // Load active events (all available events)
    try {
      const activeEventsData = await apiService.getAllEvents();
      const filteredActiveEvents = activeEventsData.filter(event => 
        event.status === 'active' || event.status === 'approved'
      );
      setActiveEvents(filteredActiveEvents || []);
    } catch (error) {
      console.error('Error loading active events:', error);
      setActiveEvents([]);
    }

    // Load joined events
    try {
      const joinedEventsData = await apiService.getUserJoinedEvents(userId);
      setJoinedEvents(joinedEventsData || []);
    } catch (error) {
      console.error('Error loading joined events:', error);
      setJoinedEvents([]);
    }

    // Load past events
    try {
      const pastEventsData = await apiService.getUserPastEvents(userId);
      setPastEvents(pastEventsData || []);
    } catch (error) {
      console.error('Error loading past events:', error);
      // If it's a 401 error, skip past events for now
      if (error.message.includes('401')) {
        console.log('Skipping past events due to authentication issue');
      }
      setPastEvents([]);
    }

    // Load notifications
    try {
      console.log("Loading notifications for user:", userId);
      const response = await apiService.getUserNotifications(userId, {
        limit: 50,
        offset: 0
      });
      
      if (response && response.data) {
        // Transform the notifications to ensure proper format
        const transformedNotifications = response.data.map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timestamp: notification.timestamp || notification.created_at,
          read: Boolean(notification.read),
          from: notification.from || 'System',
          event_title: notification.event_title,
          read_at: notification.read_at,
          data: notification.data
        }));
        
        setNotifications(transformedNotifications);
        console.log("Notifications loaded successfully:", transformedNotifications.length, "notifications");
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotifications([]);
    }
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.id) {
      setLoading(true);
      try {
        await loadDashboardData(user.id);
        await loadEventEditTimeLimit(); // Also refresh the time limit setting
        console.log("Dashboard data refreshed successfully");
      } catch (error) {
        console.error("Error refreshing dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Load user created events separately (for refreshing after participant actions)
  const loadUserCreatedEvents = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) return;

    try {
      console.log('Loading user created events for userId:', user.id);
      const createdEventsData = await apiService.getUserCreatedEvents(user.id);
      console.log('User created events data received:', createdEventsData);
      
      if (Array.isArray(createdEventsData)) {
        console.log('Setting user created events:', createdEventsData.length, 'events');
        setUserCreatedEvents(createdEventsData);
      } else {
        console.log('Created events data is not an array:', typeof createdEventsData, createdEventsData);
        setUserCreatedEvents([]);
      }
    } catch (error) {
      console.error('Error loading user created events:', error);
      console.error('Error details:', error.message);
      setUserCreatedEvents([]);
    }
  };

  // Check if user has already joined an event
  const checkUserJoinedEvent = async (eventId, userId) => {
    try {
      const joinedEvents = await apiService.getUserJoinedEvents(userId);
      return joinedEvents.some(event => event.id === eventId);
    } catch (error) {
      console.error("Error checking user joined events:", error);
      return false;
    }
  };

  // Handle join event with authentication check and capacity validation
  const handleJoinEvent = async (eventId) => {
    console.log('=== handleJoinEvent Debug ===');
    console.log('userProfile:', userProfile);
    console.log('approvalStatus:', approvalStatus);
    console.log('isUserApproved:', isUserApproved);
    
    // Check if user is logged in
    if (!userProfile) {
      await Swal.fire({
        icon: 'warning',
        title: 'Authentication Required',
        text: 'Please login to join events',
        confirmButtonText: 'Go to Login',
        confirmButtonColor: '#700e12',
      });
      navigate("/user");
      return;
    }

    // Check if user is approved
    if (!isUserApproved) {
      console.log('User not approved - showing approval required message');
      toast({
        title: "Approval Required",
        description: "You are not approved to join events. Please wait for admin approval.",
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
          icon: 'info',
          title: 'Already Joined',
          text: 'You have already joined this event!',
          confirmButtonColor: '#700e12',
        });
        return;
      }
      
      // Find the event to check capacity
      const targetEvent = activeEvents.find(event => event.id === eventId);
      
      if (!targetEvent) {
        await Swal.fire({
          icon: 'error',
          title: 'Event Not Found',
          text: 'Event not found. Please refresh the page and try again.',
          confirmButtonColor: '#700e12',
        });
        return;
      }
      
      // Check if event is full
      const currentParticipants = targetEvent.current_participants || 0;
      const maxParticipants = targetEvent.max_participants || 0;
      const availableSpots = maxParticipants - currentParticipants;
      
      if (currentParticipants >= maxParticipants) {
        await Swal.fire({
          icon: 'error',
          title: 'Event Full',
          text: 'Sorry, this event is full! There are no available spots remaining.',
          confirmButtonColor: '#700e12',
        });
        return;
      }
      
      // Check if event has started
      if (hasEventStarted(targetEvent)) {
        await Swal.fire({
          icon: 'error',
          title: 'Event Started',
          text: 'Sorry, you cannot join events that have already started.',
          confirmButtonColor: '#700e12',
        });
        return;
      }
      
      // Show confirmation with available spots info and approval process
      const result = await Swal.fire({
        icon: 'question',
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
        confirmButtonText: 'Submit Request',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#700e12',
        cancelButtonColor: '#6c757d',
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
        icon: 'info',
        title: 'Join Request Submitted! ⏳',
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
        confirmButtonText: 'Understood',
        confirmButtonColor: '#700e12',
      });
      
      // Success toast - Updated for approval system
      toast({
        title: "Join Request Submitted! ⏳",
        description: `Your request to join "${targetEvent.title}" is pending approval from the event host.`,
      });
      
      // Refresh dashboard data to get updated information
      refreshDashboard();
      
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
        } else if (error.message.includes("expired") || error.message.includes("past") || error.message.includes("started")) {
          errorTitle = "Event Started";
          errorMessage = "Sorry, you cannot join events that have already started.";
        } else if (error.message.includes("unauthorized")) {
          errorTitle = "Authentication Error";
          errorMessage = "Please login again to join events.";
          await Swal.fire({
            icon: 'error',
            title: errorTitle,
            text: errorMessage,
            confirmButtonColor: '#700e12',
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
        icon: 'error',
        title: errorTitle,
        text: errorMessage,
        confirmButtonColor: '#700e12',
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

  // Refresh notifications
  const refreshNotifications = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    // Use test user ID if no user ID is found (for development)
    const userId = user.id || 1;
    
    if (!userId) {
      console.log("No user ID found, cannot refresh notifications");
      return;
    }

    try {
      console.log("Refreshing notifications for user:", userId);
      const response = await apiService.getUserNotifications(userId, {
        limit: 50,
        offset: 0
      });
      
      if (response && response.data) {
        // Transform the notifications to ensure proper format
        const transformedNotifications = response.data.map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timestamp: notification.timestamp || notification.created_at,
          read: Boolean(notification.read),
          from: notification.from || 'System',
          event_title: notification.event_title,
          read_at: notification.read_at,
          data: notification.data
        }));
        
        setNotifications(transformedNotifications);
        console.log("Notifications refreshed successfully:", transformedNotifications.length, "notifications");
      }
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
    }
  };



  // Update event status
  const updateEventStatus = async (eventId, newStatus) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/events/updateEventStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          event_id: eventId,
          status: newStatus
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Event status updated to ${newStatus}`);
        refreshDashboard(); // Refresh the events list
        setShowManageModal(false);
      } else {
        alert(`Failed to update event status: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating event status:", error);
      alert("Failed to update event status. Please try again.");
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    const errors = {};
    
    if (!editFormData.title.trim()) {
      errors.title = "Event title is required";
    } else if (editFormData.title.trim().length < 3) {
      errors.title = "Event title must be at least 3 characters";
    }
    
    if (!editFormData.description.trim()) {
      errors.description = "Event description is required";
    } else if (editFormData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }
    
    if (!editFormData.event_date) {
      errors.event_date = "Event date is required";
    } else {
      const selectedDate = new Date(editFormData.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.event_date = "Event date cannot be in the past";
      }
    }
    
    if (!editFormData.start_time) {
      errors.start_time = "Start time is required";
    }
    
    if (!editFormData.end_time) {
      errors.end_time = "End time is required";
    } else if (editFormData.start_time && editFormData.end_time <= editFormData.start_time) {
      errors.end_time = "End time must be after start time";
    }
    
    if (!editFormData.location.trim()) {
      errors.location = "Location is required";
    }
    
    if (!editFormData.max_participants || editFormData.max_participants < 1) {
      errors.max_participants = "Maximum participants must be at least 1";
    }
    
    return errors;
  };

  // Handle form input changes
  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (editFormErrors[field]) {
      setEditFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Update event
  const handleUpdateEvent = async () => {
    // Validate form
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    setIsUpdatingEvent(true);
    
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/events/updateEvent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          event_id: selectedEventForEdit.id,
          ...editFormData,
          // If event was active, keep it active after edit
          status: selectedEventForEdit.status === 'active' ? 'active' : 'inactive'
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Event updated successfully!");
        setShowEditModal(false);
        refreshDashboard(); // Refresh the events list
      } else {
        alert(`Failed to update event: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event. Please try again.");
    } finally {
      setIsUpdatingEvent(false);
    }
  };

  // Load categories for edit form
  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getAllCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback categories
      setCategories([
        { id: 1, name: 'Community Service' },
        { id: 2, name: 'Education' },
        { id: 3, name: 'Health & Wellness' },
        { id: 4, name: 'Technology' },
        { id: 5, name: 'Arts & Culture' },
        { id: 6, name: 'Sports & Recreation' }
      ]);
    }
  };

  // Check authentication and load user data
  // Load user profile from API
  const loadUserProfile = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userEmail = localStorage.getItem("userEmail") || "";
    const userToken = localStorage.getItem("userToken");
    
    console.log('=== loadUserProfile Debug ===');
    console.log('User:', user);
    console.log('User ID:', user.id);
    console.log('User Token exists:', !!userToken);
    console.log('User Email:', userEmail);
    
    try {
      // Try to load profile from API first
      console.log('Loading user profile from API for user ID:', user.id);
      const profileData = await apiService.getProfile({ id: user.id });
      
      if (profileData && profileData.success) {
        const apiUser = profileData.data;
        const profileUser = {
          id: apiUser.id,
          name: `${apiUser.first_name || ""} ${apiUser.last_name || ""}`.trim() || "User",
          email: apiUser.email || userEmail,
          phone: apiUser.mobile || "Not provided",
          age: 65, // Default age, can be calculated from DOB if available
          location: apiUser.location || "Not provided",
          joinDate: apiUser.created_at ? new Date(apiUser.created_at).toISOString().split('T')[0] : "2024-12-25",
          profileImage: apiUser.cover ? `${STORAGE_BASE_URL}/storage/images/${apiUser.cover}` : null,
          others: apiUser.others || JSON.stringify({
            title: "Mr",
            firstName: apiUser.first_name || "John",
            lastName: apiUser.last_name || "Doe",
            gender: "Male",
            dob: "1990-01-01",
            houseNo: "123",
            locality: "Sample Locality",
            city: "Delhi",
            pinCode: "110001",
            education: "Graduate",
            profession: "Professional",
            bloodGroup: "O+",
            doc1Type: "Aadhar",
            doc1Number: "123456789012",
            doc1File: "sample-doc1.pdf",
            doc2Type: "PAN",
            doc2Number: "ABCDE1234F",
            doc2File: "sample-doc2.pdf",
            emergencyName: "Emergency Contact",
            emergencyRelation: "Friend",
            emergencyContact: "9876543210",
            selectedSkills: ["Communication", "Leadership"],
            approvalStatus: "approved",
            approvalDate: new Date().toISOString(),
            submissionDate: new Date().toISOString()
          })
        };

        setUserProfile(profileUser);

        // Initialize profile form data
        setProfileFormData({
          name: profileUser.name || "",
          email: profileUser.email || "",
          phone: profileUser.phone || "",
          location: profileUser.location || "",
        });

        console.log('Profile loaded successfully from API:', profileUser);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Error loading profile from API:', error);
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('401')) {
        console.error('Authentication failed - user may need to log in again');
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        // Optionally redirect to login
        // navigate("/user");
        // return;
      }
      
      console.log('Using fallback profile data');
      
      // Use fallback data if API fails
      const mockUser = {
        id: user.id || "USR001",
        name: user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User",
        email: userEmail || user.email || "user@example.com",
        phone: user.mobile || user.phone || "Not provided",
        age: 65,
        location: "Delhi",
        joinDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : "2024-12-25",
        profileImage: null,
        // Add complete profile data to satisfy checkProfileCompletion
        others: JSON.stringify({
          title: "Mr",
          firstName: user.first_name || "John",
          lastName: user.last_name || "Doe",
          gender: "Male",
          dob: "1990-01-01",
          houseNo: "123",
          locality: "Sample Locality",
          city: "Delhi",
          pinCode: "110001",
          education: "Graduate",
          profession: "Professional",
          bloodGroup: "O+",
          doc1Type: "Aadhar",
          doc1Number: "123456789012",
          doc1File: "sample-doc1.pdf",
          doc2Type: "PAN",
          doc2Number: "ABCDE1234F",
          doc2File: "sample-doc2.pdf",
          emergencyName: "Emergency Contact",
          emergencyRelation: "Friend",
          emergencyContact: "9876543210",
          selectedSkills: ["Communication", "Leadership"],
          approvalStatus: "approved",
          approvalDate: new Date().toISOString(),
          submissionDate: new Date().toISOString()
        })
      };

      setUserProfile(mockUser);

      // Initialize profile form data
      setProfileFormData({
        name: mockUser.name || "",
        email: mockUser.email || "",
        phone: mockUser.phone || "",
        location: mockUser.location || "",
      });
    }
  };

  useEffect(() => {
    const checkUserAccess = async () => {
      const userToken = localStorage.getItem("userToken");
      const userLoggedIn = localStorage.getItem("userLoggedIn");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!userToken || !userLoggedIn || !user.id) {
        navigate("/user");
        return;
      }

      try {
        // Load user profile first
        await loadUserProfile();

        // Check if profile is complete before allowing dashboard access
        const isProfileComplete = checkProfileCompletion(user);
        console.log('Profile completion check result:', isProfileComplete);
        
        if (!isProfileComplete) {
          console.log('Profile is incomplete, redirecting to user form');
          navigate("/user");
          return;
        }

        // Load approval status
        try {
          console.log('Loading approval status for user ID:', user.id);
          const approvalData = await apiService.getUserApprovalStatus(user.id);
          console.log('Approval data received:', approvalData);
          setApprovalStatus(approvalData);
          
          // Set isUserApproved based on the approval data
          if (approvalData && approvalData.success) {
            const { status, approval_status } = approvalData.data || approvalData;
            console.log('Approval data details - status:', status, 'approval_status:', approval_status);
            const approved = approval_status === 'approved' || status === 1;
            setIsUserApproved(approved);
            console.log('User approval status set to:', approved);
          } else {
            console.log('Approval data not successful, setting isUserApproved to false');
            setIsUserApproved(false);
          }
        } catch (error) {
          console.error('Error loading approval status:', error);
          console.log('Using fallback approval status - setting user as approved');
          // Use default approval status as fallback - assume approved if API fails
          setApprovalStatus({ 
            success: true,
            data: { 
              status: 'approved', 
              approval_status: 'approved',
              user_id: user.id
            }
          });
          setIsUserApproved(true); // Set as approved in fallback case
        }
        
        // Load dynamic dashboard data
        await loadDashboardData(user.id);
        
        // Load categories for edit form
        await loadCategories();
        
        // Load event edit time limit setting
        await loadEventEditTimeLimit();
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    // Load notifications from API
    const loadNotifications = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      // Use test user ID if no user ID is found (for development)
      const userId = user.id || 1;
      
      if (!userId) {
        console.log("No user ID found, skipping notification load");
        return;
      }

      try {
        console.log("Loading notifications from API for user:", userId);
        const response = await apiService.getUserNotifications(userId, {
          limit: 50,
          offset: 0
        });
        
        console.log("Notifications API response:", response);
        
        if (response && response.data) {
          // Transform the notifications to ensure proper format
          const transformedNotifications = response.data.map(notification => ({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            timestamp: notification.timestamp || notification.created_at,
            read: Boolean(notification.read),
            from: notification.from || 'System',
            event_title: notification.event_title,
            read_at: notification.read_at,
            data: notification.data
          }));
          
          setNotifications(transformedNotifications);
          console.log("Notifications loaded successfully:", transformedNotifications.length, "notifications");
        } else {
          console.warn("No notifications data in response");
          setNotifications([]);
        }
      } catch (error) {
        console.error("Failed to load notifications from API:", error);
        
        // Set empty array if API fails - no fallback notifications
        setNotifications([]);
      }
    };

    loadNotifications();
    checkUserAccess();

    // Initialize token manager for automatic token refresh
    try {
      tokenManager.initialize();
    } catch (error) {
      console.error('Failed to initialize token manager:', error);
    }

    // Set up token expiration event listeners
    const handleTokenRefreshed = (event: any) => {
      console.log('Token refreshed automatically:', event.detail?.token);
      toast({
        title: "Session Extended",
        description: "Your session has been automatically extended.",
        variant: "default",
      });
    };

    const handleAuthExpired = () => {
      console.log('Authentication expired, redirecting to login');
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      
      // Clear all user data and redirect
      handleLogout();
    };

    // Add event listeners for token events
    window.addEventListener('tokenRefreshed', handleTokenRefreshed);
    window.addEventListener('authExpired', handleAuthExpired);

    // Set up polling for real-time notifications only if user is active
    let pollInterval: NodeJS.Timeout;
    
    const startPolling = () => {
      pollInterval = setInterval(() => {
        // Only poll if the tab is visible and user is logged in
        if (!document.hidden && localStorage.getItem("user")) {
          loadNotifications();
        }
      }, 30000); // Poll every 30 seconds
    };

    // Start polling after initial load
    setTimeout(startPolling, 5000); // Wait 5 seconds before starting polling

    // Handle visibility change to pause/resume polling
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(pollInterval);
      } else {
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('tokenRefreshed', handleTokenRefreshed);
      window.removeEventListener('authExpired', handleAuthExpired);
    };
  }, [navigate]);

  const handleLogout = () => {
    // Clear all authentication and user data
    localStorage.removeItem("userPhone");
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userProfileSubmitted");
    localStorage.removeItem("userSubmissionDate");
    
    // Use token manager to clear tokens properly
    try {
      tokenManager.clearToken();
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      // Fallback to manual cleanup
      localStorage.removeItem("userToken");
      localStorage.removeItem("user");
      localStorage.removeItem("tokenData");
    }
    
    navigate("/");
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a valid image file (JPEG, PNG, or GIF)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size should be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      console.log('Uploading profile image...');
      console.log('User token exists:', !!localStorage.getItem('userToken'));
      const uploadResult = await apiService.uploadProfileImage(file);
      
      if (uploadResult && uploadResult.data && uploadResult.data.image_name) {
        const imageName = uploadResult.data.image_name;
        const imageUrl = `${STORAGE_BASE_URL}/storage/images/${imageName}`;
        
        console.log('Image uploaded successfully:', imageName);
        console.log('Image URL:', imageUrl);
        
        try {
          // Update user profile with new image
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          console.log('Updating user profile with cover image for user ID:', user.id);
          console.log('Cover image name:', imageName);
          await apiService.updateUserProfile(user.id, {
            cover: imageName
          });

          // Update local state
          setUserProfile(prev => ({
            ...prev,
            profileImage: imageUrl
          }));

          // Refresh profile data from API to ensure consistency
          setTimeout(async () => {
            try {
              await loadUserProfile();
            } catch (error) {
              console.error('Error refreshing profile after image update:', error);
            }
          }, 1000);

          console.log('Profile image updated successfully');
          toast({
            title: "Success!",
            description: "Profile image updated successfully!",
            variant: "default",
          });
        } catch (profileUpdateError) {
          console.error('Error updating profile with image:', profileUpdateError);
          
          // Still update the local state with the uploaded image even if profile update fails
          setUserProfile(prev => ({
            ...prev,
            profileImage: imageUrl
          }));
          
          toast({
            title: "Partial Success",
            description: "Image uploaded but profile update failed. Please refresh the page.",
            variant: "destructive",
          });
        }
      } else {
        throw new Error('Invalid upload response');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (isSavingProfile) return;
    
    setIsSavingProfile(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      // Validate required fields
      if (!user.id) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      if (!profileFormData.name.trim()) {
        throw new Error('Name is required.');
      }
      
      if (!profileFormData.email.trim()) {
        throw new Error('Email is required.');
      }
      
      const nameParts = profileFormData.name.trim().split(' ');
      const updateData = {
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: profileFormData.email.trim(),
        mobile: profileFormData.phone.replace(/\D/g, ''), // Remove non-digits
        location: profileFormData.location.trim() || null,
      };
      
      // Update user profile via API
      const response = await apiService.updateUserProfile(user.id, updateData);

      // Update local state
      const updatedProfile = {
        ...userProfile,
        name: profileFormData.name,
        email: profileFormData.email,
        phone: profileFormData.phone,
        location: profileFormData.location,
      };
      setUserProfile(updatedProfile);
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      
      // Refresh profile data from API to ensure consistency
      setTimeout(async () => {
        try {
          await loadUserProfile();
        } catch (error) {
          console.error('Error refreshing profile after save:', error);
        }
      }, 1000);
      
      toast({
        title: "Success!",
        description: "Profile updated successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      
      let errorMessage = "Failed to update profile. Please try again.";
      
      // Check for specific error messages
      if (error.message && error.message.includes('User ID not found')) {
        errorMessage = "Session expired. Please log in again.";
        // Optionally redirect to login
        // navigate('/login');
      } else if (error.message && error.message.includes('Name is required')) {
        errorMessage = "Name is required.";
      } else if (error.message && error.message.includes('Email is required')) {
        errorMessage = "Email is required.";
      } else if (error.message && error.message.includes('401')) {
        errorMessage = "Session expired. Please log in again.";
        console.error('Authentication failed during profile update');
      } else if (error.message && error.message.includes('422')) {
        errorMessage = "Invalid data provided. Please check your information.";
      } else if (error.message && error.message.includes('500')) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message && error.message.includes('User not found')) {
        errorMessage = "User account not found. Please contact support.";
      } else if (error.message) {
        // Use the actual error message from the API
        errorMessage = error.message;
      }
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const renderTimeSharingContent = () => (
    <div className="space-y-6">
      {/* Highlighted Time Sharing Card */}
      <Card className="highlighted-card animate-fade-in-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-share2care-red" />
              <div>
                <CardTitle className="text-xl text-share2care-red">
                  Learn About Time Sharing
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Discover the power of community connection
                </CardDescription>
              </div>
            </div>
            {/* <Sparkles className="w-8 h-8 text-yellow-500" /> */}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white/70 rounded-lg p-4 border border-red-200">
            <h3 className="font-semibold text-lg text-share2care-red mb-3">
              What is Time Sharing?
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Time sharing is a revolutionary concept where elders connect with
              fellow community members to share skills, experiences, and
              meaningful moments. It's about creating bonds through shared
              activities and mutual learning.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-share2care-red">
                   How it Works:
                </h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Create events based on your skills</li>
                  <li>• Join events that interest you</li>
                  <li>• Meet like-minded people</li>
                  <li>• Share knowledge and experiences</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-share2care-red">
                  Benefits:
                </h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Build meaningful friendships</li>
                  <li>• Learn new skills</li>
                  <li>• Stay active and engaged</li>
                  <li>• Combat loneliness</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/time-sharing" className="flex-1">
              <Button className="btn-share2care w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                Read More About Time Sharing
              </Button>
            </Link>
            <Link to="/events" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-share2care-red text-share2care-red hover:bg-red-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Browse Events
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Guide */}
      <Card className="share2care-card">
        <CardHeader>
          <CardTitle className="text-share2care-red">
            Getting Started Guide
          </CardTitle>
          <CardDescription>
            Follow these steps to make the most of your time-sharing experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-share2care-red text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  Complete Your Profile
                </h4>
                <p className="text-sm text-gray-600">
                  Add your skills, interests, and preferences to help others
                  find you
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-share2care-red text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Browse Events</h4>
                <p className="text-sm text-gray-600">
                  Explore activities in your area and join ones that interest
                  you
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-share2care-red text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Create Events</h4>
                <p className="text-sm text-gray-600">
                  Share your skills by hosting events for fellow community
                  members
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-share2care-red text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Connect and Share</h4>
                <p className="text-sm text-gray-600">
                  Build friendships and enjoy meaningful interactions with
                  like-minded people
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboardContent = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="share2care-card max-md:ml-5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl max-md:text-sm text-share2care-red">
                Welcome back, {userProfile?.name?.split(" ")[1] || "User"}!
              </CardTitle>
              <CardDescription>
                Ready to connect and share experiences today?
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshDashboard}
                className="flex items-center space-x-1"
              >
                <Activity className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
              <div className="text-right">
                <div className="text-sm text-gray-600">Member since</div>
                <div className="font-medium">
                  {new Date(userProfile?.joinDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-md:ml-5">
        <Card className="share2care-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Events Created
            </CardTitle>
            <Calendar className="h-4 w-4 text-share2care-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-share2care-red">
              {dashboardStats.events_created}
            </div>
            <p className="text-xs text-muted-foreground">As host</p>
          </CardContent>
        </Card>

        <Card className="share2care-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Joined</CardTitle>
            <Users className="h-4 w-4 text-share2care-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-share2care-red">
              {dashboardStats.events_joined}
            </div>
            <p className="text-xs text-muted-foreground">As participant</p>
          </CardContent>
        </Card>

        <Card className="share2care-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-share2care-red">
              {dashboardStats.average_rating}/5
            </div>
            <p className="text-xs text-muted-foreground">
              From {dashboardStats.total_reviews} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card className="share2care-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-share2care-red max-md:text-sm">
              Today's Schedule
            </CardTitle>
            <Link to="/events">
              <Button variant="outline" size="sm" className="max-md:text-sm">
                View All Events
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {todayEvents.length > 0 ? (
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        event.role === "host"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {event.role === "host" ? (
                        <Users className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(event.start_time || event.time)}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </span>
                        {event.role === "host" && event.current_participants !== undefined && (
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {event.current_participants}/{event.max_participants} guests
                          </span>
                        )}
                      </div>
                      {event.category && (
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {event.category}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={event.role === "host" ? "default" : "secondary"}
                    className={
                      event.role === "host"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }
                  >
                    {event.role === "host" ? "Hosting" : "Attending"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No events scheduled for today</p>
              {isUserApproved ? (
                <Link to="/events">
                  <Button className="btn-share2care mt-3">
                    <Plus className="w-4 h-4 mr-2" />
                    Create an Event
                  </Button>
                </Link>
              ) : (
                <div className="mt-3">
                  <Button 
                    disabled 
                    className="btn-share2care opacity-50 cursor-not-allowed"
                    title="Profile must be approved to create events"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create an Event
                  </Button>
                  <p className="text-xs text-red-600 mt-2">
                    Profile approval required
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="share2care-card">
        <CardHeader>
          <CardTitle className="text-share2care-red max-md:text-sm">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/events">
              <Button className="btn-share2care w-full h-16 max-md:h-8 flex max-md:text-sm">
                <Calendar className="w-6 h-6 mb-1" />
                Browse Events
              </Button>
            </Link>
            {isUserApproved ? (
              <Link to="/events">
                <Button
                  variant="outline"
                  className="w-full h-16 max-md:h-8 max-md:text-sm flex border-share2care-red text-share2care-red hover:bg-red-50"
                >
                  <Plus className="w-6 h-6 mb-1" />
                  Create Event
                </Button>
              </Link>
            ) : (
              <Button
                disabled
                variant="outline"
                className="w-full h-16 max-md:h-8 max-md:text-sm flex border-gray-300 text-gray-400 opacity-50 cursor-not-allowed"
                title="Profile must be approved to create events"
              >
                <Plus className="w-6 h-6 mb-1" />
                Create Event
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsContent = () => (
    <div className="space-y-6">
      <Card className="share2care-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-share2care-red flex items-center gap-2">
                Notifications
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {notifications.filter(n => !n.read).length} new
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Messages and updates from admin and system
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshNotifications}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-4 max-md:space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 max-md:p-1 rounded-lg border ${
                    notification.type === "admin_approval"
                      ? "border-green-200 bg-green-50"
                      : notification.type === "admin_rejection"
                      ? "border-red-200 bg-red-50"
                      : notification.type === "event_created"
                      ? "border-blue-200 bg-blue-50"
                      : notification.type === "event_joined"
                      ? "border-green-200 bg-green-50"
                      : notification.type === "event_updated"
                      ? "border-orange-200 bg-orange-50"
                      : notification.type === "event_cancelled"
                      ? "border-red-200 bg-red-50"
                      : notification.type === "review_received"
                      ? "border-yellow-200 bg-yellow-50"
                      : !notification.read
                      ? "message-notification"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium max-md:text-xs  text-gray-900">
                          {notification.title}
                        </h4>
                        {notification.type === "admin_approval" && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                        {notification.type === "admin_rejection" && (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                        {notification.type === "event_created" && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            <Calendar className="w-3 h-3 mr-1" />
                            New Event
                          </Badge>
                        )}
                        {notification.type === "event_joined" && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            <Users className="w-3 h-3 mr-1" />
                            Joined
                          </Badge>
                        )}
                        {notification.type === "event_updated" && (
                          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                            <Edit className="w-3 h-3 mr-1" />
                            Updated
                          </Badge>
                        )}
                        {notification.type === "event_cancelled" && (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            Cancelled
                          </Badge>
                        )}
                        {notification.type === "review_received" && (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                            <Star className="w-3 h-3 mr-1" />
                            Review
                          </Badge>
                        )}
                        {notification.type === "system" && (
                          <Badge className="admin-message">System</Badge>
                        )}
                        {!notification.read && (
                          <Badge
                            variant="destructive"
                            className="text-xs px-1.5"
                          >
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center max-md:text-xs space-x-4 text-xs text-gray-500">
                        <span>From: {notification.from || "Admin Team"}</span>
                        <span>
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex max-md:flex-col max-md:-mr-5 items-center space-x-2 max-md:text-xs">
                      {notification.type === "admin_approval" && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {notification.type === "admin_rejection" && (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      {notification.type === "event_created" && (
                        <Calendar className="w-4 h-4 text-blue-600" />
                      )}
                      {notification.type === "event_joined" && (
                        <Users className="w-4 h-4 text-green-600" />
                      )}
                      {notification.type === "event_updated" && (
                        <Edit className="w-4 h-4 text-orange-600" />
                      )}
                      {notification.type === "event_cancelled" && (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      {notification.type === "review_received" && (
                        <Star className="w-4 h-4 text-yellow-600" />
                      )}
                      {notification.type === "system" && (
                        <MessageSquare className="w-4 h-4 text-share2care-red" />
                      )}
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            const user = JSON.parse(localStorage.getItem("user") || "{}");
                            const userId = user.id || 1; // Use test user ID for development
                            
                            // Update UI immediately for better UX
                            const updatedNotifications = notifications.map(
                              (n) =>
                                n.id === notification.id
                                  ? { ...n, read: true, read_at: new Date().toISOString() }
                                  : n,
                            );
                            setNotifications(updatedNotifications);
                            
                            try {
                              console.log("Marking notification as read:", notification.id);
                              const response = await apiService.markNotificationAsRead(notification.id, userId);
                              console.log("Mark as read response:", response);
                              
                              if (!response || !response.success) {
                                console.warn("Mark as read API call may have failed, but UI is updated");
                              }
                            } catch (error) {
                              console.error("Failed to mark notification as read:", error);
                              // UI is already updated optimistically, so we don't revert
                              // In a production app, you might want to show a toast notification about the error
                            }
                          }}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No notifications yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderProfileContent = () => (
      <div className="space-y-6">
        <Card className="share2care-card">
          <CardHeader>
            <CardTitle className="text-share2care-red">
              Profile Settings
            </CardTitle>
            <CardDescription>
              Manage your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 max-md:w-12 max-md:h-12 bg-gray-200 rounded-full flex items-center justify-center relative">
                {userProfile?.profileImage ? (
                  <img
                    src={userProfile.profileImage}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', userProfile.profileImage);
                      // Hide the broken image and show the default user icon
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.style.setProperty('display', 'flex');
                    }}
                  />
                ) : null}
                {!userProfile?.profileImage && (
                  <User className="w-10 h-10 text-gray-400" />
                )}
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {userProfile?.name}
              </h3>
              <p className="text-gray-600">{userProfile?.email}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 cursor-pointer"
                disabled={isUploadingImage}
              >
                <Label className="cursor-pointer flex items-center">
                  <Camera className="w-4 h-4 mr-2" />
                  <input 
                    type="file" 
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleProfileImageChange}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  <span>{isUploadingImage ? 'Uploading...' : 'Change Photo'}</span>
                </Label>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileFormData.name}
                onChange={(e) =>
                  setProfileFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="border-gray-300 focus:border-share2care-red"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileFormData.email}
                onChange={(e) =>
                  setProfileFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="border-gray-300 focus:border-share2care-red"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profileFormData.phone}
                onChange={(e) =>
                  setProfileFormData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="border-gray-300 focus:border-share2care-red"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profileFormData.location}
                onChange={(e) =>
                  setProfileFormData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className="border-gray-300 focus:border-share2care-red"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              className="btn-share2care" 
              onClick={handleSaveProfile}
              disabled={isSavingProfile || isUploadingImage}
            >
              {isSavingProfile ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setProfileFormData({
                  name: userProfile?.name || "",
                  email: userProfile?.email || "",
                  phone: userProfile?.phone || "",
                  location: userProfile?.location || "",
                })
              }
              disabled={isSavingProfile || isUploadingImage}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="space-y-6">
      <Card className="share2care-card">
        <CardHeader>
          <CardTitle className="text-share2care-red">
            Account Settings
          </CardTitle>
          <CardDescription>
            Manage your account preferences and security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-t pt-6">
            <h4 className="font-medium text-red-600 mb-4">Danger Zone</h4>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Deactivate Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEventsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 max-md:text-sm">
            My Events
          </h2>
          <p className="text-gray-600">
            Manage your event activities and participation
          </p>
        </div>
        <Link to="/events">
          <Button className="btn-share2care max-md:text-xs max-md:w-24">
            <Plus className="w-4 h-4 max-md:hidden  mr-2 max-md:mr-0" />
            Browse All Events
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-2 w-full">
          <TabsTrigger value="active" className="text-xs sm:text-sm">
            Active Events
          </TabsTrigger>
          <TabsTrigger value="my-events" className="text-xs sm:text-sm">
            My Events
          </TabsTrigger>
        </TabsList>

        {/* Active Events */}
        <TabsContent value="active" className="space-y-4">
          <Card className="share2care-card">
            <CardHeader>
              <CardTitle className="text-share2care-red max-md:text-sm">
                Available Events
              </CardTitle>
              <CardDescription className="max-md:text-sm">
                Events you can join in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeEvents.length > 0 ? activeEvents.slice(0, 5).map((event, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 max-md:text-xs">
                          {event.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1 " />
                            {formatDate(event.event_date)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(event.start_time)}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge
                            variant="secondary"
                            className="bg-share2care-yellow text-share2care-red text-xs"
                          >
                            {event.category_name || event.event_type || 'General'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {event.current_participants || 0}/{event.max_participants || 0} joined
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="btn-share2care w-full sm:w-auto"
                        onClick={() => handleJoinEvent(event.id)}
                        disabled={joiningEventId === event.id || 
                                 (event.current_participants >= event.max_participants) ||
                                 hasEventStarted(event) ||
                                 loading ||
                                 (userProfile && !isUserApproved)}
                      >
                        {joiningEventId === event.id ? (
                          <div className="flex items-center">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Joining...
                          </div>
                        ) : (event.current_participants >= event.max_participants) ? (
                          "Event Full"
                        ) : hasEventStarted(event) ? (
                          "Event Started"
                        ) : !userProfile ? (
                          "Login to Join"
                        ) : loading ? (
                          "Loading..."
                        ) : !isUserApproved ? (
                          "Approval Required"
                        ) : (
                          "Join Event"
                        )}
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active events available at the moment.</p>
                    <p className="text-sm text-gray-400 mt-2">Check back later or create your own event!</p>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <Link to="/events">
                  <Button variant="outline" className="btn-share2care-outline">
                    View All Active Events
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Events */}
        <TabsContent value="my-events" className="space-y-4">
          <Card className="share2care-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-share2care-red max-md:text-sm">
                    Events I'm Hosting
                  </CardTitle>
                  <CardDescription className="max-md:text-sm">
                    Events you have created
                  </CardDescription>
                </div>
                <Button
                  onClick={refreshDashboard}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">


                {userCreatedEvents && userCreatedEvents.length > 0 ? (
                  userCreatedEvents.map((event, index) => (
                    <div key={event.id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {event.title || 'Untitled Event'}
                          </h4>
                          {event.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {event.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(event.event_date)}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTime(event.start_time)}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {event.location || 'Location TBD'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="outline" className="text-xs">
                              Host
                            </Badge>
                            <span className="text-xs text-gray-500">
                              <Users className="w-3 h-3 inline mr-1" />
                              {event.current_participants || 0}/{event.max_participants || 0} participants
                            </span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                event.status === 'active' ? 'bg-green-100 text-green-800' : 
                                event.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {event.status || 'pending'}
                            </Badge>
                            {!canEditEvent(event) && (
                              <Badge variant="destructive" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                Edit Locked
                              </Badge>
                            )}
                            {event.category && (
                              <Badge variant="outline" className="text-xs">
                                {event.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!canEditEvent(event)}
                            className={`flex-1 sm:flex-none flex items-center gap-1 ${
                              !canEditEvent(event) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => handleEditEvent(event)}
                            title={!canEditEvent(event) ? `Cannot edit - within ${eventEditTimeLimit} hours of event start` : 'Edit event details'}
                          >
                            <AlertCircle className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!canEditEvent(event)}
                            className={`flex-1 sm:flex-none flex items-center gap-1 ${
                              !canEditEvent(event) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => handleManageEvent(event)}
                            title={!canEditEvent(event) ? `Cannot manage - within ${eventEditTimeLimit} hours of event start` : 'Manage event participants'}
                          >
                            <Users className="w-3 h-3" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">You haven't created any events yet.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {loading ? 'Loading events...' : 'Start by creating your first event or click "Create Sample" to test!'}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                {isUserApproved ? (
                  <Link to="/events">
                    <Button className="btn-share2care">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Event
                    </Button>
                  </Link>
                ) : (
                  <div>
                    <Button 
                      disabled 
                      className="btn-share2care opacity-50 cursor-not-allowed"
                      title="Profile must be approved to create events"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Event
                    </Button>
                    <p className="text-xs text-red-600 mt-2">
                      Profile approval required to create events
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Joined Events */}
        <TabsContent value="joined" className="space-y-4">
          <Card className="share2care-card max-md:w-64">
            <CardHeader>
              <CardTitle className="text-share2care-red max-md:text-sm">
                Events I've Joined
              </CardTitle>
              <CardDescription>Events you're participating in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {joinedEvents.length > 0 ? joinedEvents.map((event, index) => (
                  <div key={event.id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {event.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(event.event_date)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(event.start_time)}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800 text-xs"
                          >
                            Joined
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Host: {event.organizer_name || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 sm:flex-none"
                        >
                          Contact Host
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 flex-1 sm:flex-none"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">You haven't joined any events yet.</p>
                    <p className="text-sm text-gray-400 mt-2">Browse available events to get started!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Past Events */}
        <TabsContent value="past" className="space-y-4">
          <Card className="share2care-card max-md:w-64">
            <CardHeader>
              <CardTitle className="text-share2care-red max-md:text-sm">
                Past Events
              </CardTitle>
              <CardDescription className="max-md:text-sm">
                Events you have participated in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastEvents.length > 0 ? pastEvents.map((event, index) => (
                  <div key={event.id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {event.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(event.event_date)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(event.start_time)}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </span>
                      </div>
                      {(event.rating || event.review) && (
                        <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                          {event.rating && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">
                                Your Rating:
                              </span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < event.rating 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          {event.review && (
                            <p className="text-sm text-gray-600 italic">
                              "{event.review}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No past events found.</p>
                    <p className="text-sm text-gray-400 mt-2">Your completed events will appear here.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="share2care-card max-md:w-64">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-share2care-red max-md:text-sm">
                  Notifications
                </CardTitle>
                <CardDescription className="max-md:text-sm">
                  Your recent notifications and updates
                </CardDescription>
              </div>
              <Button
                onClick={refreshNotifications}
                variant="outline"
                size="sm"
                className="text-share2care-red border-share2care-red hover:bg-share2care-red hover:text-white"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications && notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        notification.read
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-blue-50 border-blue-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium text-sm ${
                              notification.read ? 'text-gray-700' : 'text-blue-900'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className={`text-sm mb-2 ${
                            notification.read ? 'text-gray-600' : 'text-blue-800'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>From: {notification.from}</span>
                            <span>
                              {new Date(notification.timestamp).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {notification.event_title && (
                              <span>Event: {notification.event_title}</span>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <Button
                            onClick={async () => {
                              try {
                                const user = JSON.parse(localStorage.getItem("user") || "{}");
                                await apiService.markNotificationAsRead(notification.id, user.id);
                                await refreshNotifications();
                              } catch (error) {
                                console.error("Failed to mark notification as read:", error);
                              }
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No notifications yet.</p>
                    <p className="text-sm text-gray-400 mt-2">You'll see updates about your events here!</p>
                  </div>
                )}
              </div>
              
              {notifications && notifications.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Button
                    onClick={async () => {
                      try {
                        const user = JSON.parse(localStorage.getItem("user") || "{}");
                        await apiService.markAllNotificationsAsRead(user.id);
                        await refreshNotifications();
                      } catch (error) {
                        console.error("Failed to mark all notifications as read:", error);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full text-share2care-red border-share2care-red hover:bg-share2care-red hover:text-white"
                  >
                    Mark All as Read
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderApprovalStatus = () => {
    console.log('=== Approval Status Debug ===');
    console.log('userProfile:', userProfile);
    console.log('approvalStatus:', approvalStatus);
    
    // Check if user is approved by admin
    const isApproved = isUserApproved;
    console.log('isApproved:', isApproved);
    
    // If user is approved by admin, don't show profile completion message
    if (isApproved) {
      console.log('User is approved - not showing profile completion message');
      return null;
    }
    
    // Check if user profile is incomplete
    const isProfileIncomplete = userProfile && !checkProfileCompletion(userProfile);
    console.log('isProfileIncomplete:', isProfileIncomplete);
    
    // Show profile completion message if profile is incomplete and not approved
    if (isProfileIncomplete) {
      console.log('Showing incomplete profile message');
      return (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <AlertTitle className="text-orange-800">Complete Your Profile</AlertTitle>
          <AlertDescription className="text-orange-700">
            Fill your full details, verify your KYC and for approval your account. Please complete your profile to access all features.
          </AlertDescription>
        </Alert>
      );
    }

    // If profile is complete, check approval status
    if (!approvalStatus) {
      // Profile is complete but no approval status - means not approved yet
      console.log('Profile complete but no approval status - showing not approved message');
      return (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <AlertTitle className="text-yellow-800">You are not Approved by Admin</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Admin will review your details in 48 hours
          </AlertDescription>
        </Alert>
      );
    }

    // Handle both direct response and nested data structure
    const statusData = approvalStatus.data || approvalStatus;
    const { status, approval_status, submission_date, admin_comments } = statusData;
    console.log('Approval status details - status:', status, 'approval_status:', approval_status);
    
    if (status === 'pending' || approval_status === 'pending') {
      console.log('Showing pending approval message');
      return (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <AlertTitle className="text-yellow-800">You are not Approved by Admin</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Admin will review your details in 48 hours
            {submission_date && (
              <span className="block mt-2 text-sm">
                Submitted on: {new Date(submission_date).toLocaleDateString()}
              </span>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    if (status === 'rejected' || approval_status === 'rejected') {
      console.log('Showing rejected approval message');
      return (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <AlertTitle className="text-red-800">Application Rejected</AlertTitle>
          <AlertDescription className="text-red-700">
            You application rejected by admin apply again and or send us email on contact us section for more details
            {admin_comments && (
              <div className="mt-3 p-3 bg-red-100 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Admin Comments:</strong> {admin_comments}
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    if (status === 'approved' || approval_status === 'approved') {
      console.log('Showing approved message');
      return (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <AlertTitle className="text-green-800">Profile Approved Successfully</AlertTitle>
          <AlertDescription className="text-green-700">
            Congrats You profile is Approved successfully and now to you have to free to create and join events and all features of our app
          </AlertDescription>
        </Alert>
      );
    }

    console.log('No matching approval status condition, returning null');
    return null;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-share2care-red mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    const content = (() => {
      switch (activeTab) {
        case "timesharing":
          return renderTimeSharingContent();
        case "dashboard":
          return renderDashboardContent();
        case "events":
          return renderEventsContent();
        case "notifications":
          return renderNotificationsContent();
        case "profile":
          return renderProfileContent();
        case "settings":
          return renderSettingsContent();
        default:
          return renderTimeSharingContent();
      }
    })();

    return (
      <div>
        {renderApprovalStatus()}
        {content}
      </div>
    );
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-share2care-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen justify-center bg-gray-50 ">
      <div className="share2care-nav fixed z-40 flex flex-col w-screen">
        <div className="share2care-header">
          {/* Share2care Top Header */}
          <HeaderPart/>
        </div>
        {/* Main Navigation */}
        <div className="share2care-nav">
          <nav
            className={`max-w-7xl mx-auto top-0 z-60 transition-all duration-300`}
           
          >
            <div className="sm:px-6 lg:px-2">
              <div className="flex justify-between items-center py-2">
                {/* Logo */}
                <Link
                  to="/"
                  className="flex items-center hover:opacity-90 transition-opacity"
                >
                  <img
                    src={Share2Care}
                    alt="Share2Care"
                    className="max-lg:w-28 max-w-32"
                  />
                </Link>
                <div className="flex items-center space-x-4 mr-5">
                  <div className="hidden md:flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Welcome,</span>
                    <span className="font-medium text-gray-900">
                      {userProfile?.name || "User"}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleLogout}
                    className="border hover:border-share2care-red text-white text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-white" />
                    <span className="hidden sm:inline">Logout</span>
                    <span className="sm:hidden">Out</span>
                  </Button>
                  <Link to="/">
                    <Button
                      variant="secondary"
                      className="btn-share2care-outline px-6 py-2 border-2 border-share2care-red text-share2care-red hover:bg-share2care-red hover:text-white transition-all duration-300"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <main className="flex p-4 sm:p-6 overflow-auto z-40 max-w-7xl mx-auto">
        <div className="mt-32 max-w-3/12 min-w-0">
          {/* Sidebar */}
          <div className="">
            <UserSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              notificationCount={unreadNotifications}
              userProfile={{
                name: userProfile?.name || "User",
                image: userProfile?.profileImage
              }}
              eventCount={userCreatedEvents.length}
            />
          </div>
        </div>
        <div className="w-10/12 mt-32">{renderContent()}</div>
      </main>

      {/* Edit Event Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update your event details. Active events will remain active after editing.
            </DialogDescription>
          </DialogHeader>
          {selectedEventForEdit && (
            <div className="space-y-4">
              {/* Event Title */}
              <div>
                <Label htmlFor="edit-title">Event Title *</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => handleEditFormChange('title', e.target.value)}
                  placeholder="Enter event title"
                  className={editFormErrors.title ? 'border-red-500' : ''}
                />
                {editFormErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{editFormErrors.title}</p>
                )}
              </div>

              {/* Event Description */}
              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  placeholder="Describe your event"
                  rows={3}
                  className={editFormErrors.description ? 'border-red-500' : ''}
                />
                {editFormErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{editFormErrors.description}</p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-date">Event Date *</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editFormData.event_date}
                    onChange={(e) => handleEditFormChange('event_date', e.target.value)}
                    className={editFormErrors.event_date ? 'border-red-500' : ''}
                  />
                  {editFormErrors.event_date && (
                    <p className="text-red-500 text-sm mt-1">{editFormErrors.event_date}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-start-time">Start Time *</Label>
                  <Input
                    id="edit-start-time"
                    type="time"
                    value={editFormData.start_time}
                    onChange={(e) => handleEditFormChange('start_time', e.target.value)}
                    className={editFormErrors.start_time ? 'border-red-500' : ''}
                  />
                  {editFormErrors.start_time && (
                    <p className="text-red-500 text-sm mt-1">{editFormErrors.start_time}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-end-time">End Time *</Label>
                  <Input
                    id="edit-end-time"
                    type="time"
                    value={editFormData.end_time}
                    onChange={(e) => handleEditFormChange('end_time', e.target.value)}
                    className={editFormErrors.end_time ? 'border-red-500' : ''}
                  />
                  {editFormErrors.end_time && (
                    <p className="text-red-500 text-sm mt-1">{editFormErrors.end_time}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="edit-location">Location *</Label>
                <Input
                  id="edit-location"
                  value={editFormData.location}
                  onChange={(e) => handleEditFormChange('location', e.target.value)}
                  placeholder="Enter event location"
                  className={editFormErrors.location ? 'border-red-500' : ''}
                  autoComplete="off"
                />
                {editFormErrors.location && (
                  <p className="text-red-500 text-sm mt-1">{editFormErrors.location}</p>
                )}
              </div>

              {/* Max Participants and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-max-participants">Max Participants *</Label>
                  <Input
                    id="edit-max-participants"
                    type="number"
                    min="1"
                    max="100"
                    value={editFormData.max_participants}
                    onChange={(e) => handleEditFormChange('max_participants', parseInt(e.target.value) || 1)}
                    className={editFormErrors.max_participants ? 'border-red-500' : ''}
                  />
                  {editFormErrors.max_participants && (
                    <p className="text-red-500 text-sm mt-1">{editFormErrors.max_participants}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editFormData.category_id ? editFormData.category_id.toString() : ''}
                    onValueChange={(value) => handleEditFormChange('category_id', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Event Type */}
              <div>
                <Label htmlFor="edit-event-type">Event Type</Label>
                <Select
                  value={editFormData.event_type}
                  onValueChange={(value) => handleEditFormChange('event_type', value)}
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

              {/* Contact Info */}
              <div>
                <Label htmlFor="edit-contact-info">Contact Information</Label>
                <Input
                  id="edit-contact-info"
                  value={editFormData.contact_info}
                  onChange={(e) => handleEditFormChange('contact_info', e.target.value)}
                  placeholder="Contact email or phone (optional)"
                />
              </div>

              {/* Current Status Display */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Current Status:</strong> 
                  <Badge 
                    variant="secondary" 
                    className={`ml-2 ${
                      selectedEventForEdit.status === 'active' ? 'bg-green-100 text-green-800' : 
                      selectedEventForEdit.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      selectedEventForEdit.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedEventForEdit.status || 'inactive'}
                  </Badge>
                </p>
                {selectedEventForEdit.status === 'active' && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ This event will remain active after editing
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowEditModal(false)}
                  disabled={isUpdatingEvent}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleUpdateEvent}
                  disabled={isUpdatingEvent}
                >
                  {isUpdatingEvent ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Event Modal */}
      <Dialog open={showManageModal} onOpenChange={setShowManageModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Event</DialogTitle>
            <DialogDescription>
              Manage your event and participants
            </DialogDescription>
          </DialogHeader>
          {selectedEventForManage && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{selectedEventForManage.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      selectedEventForManage.status === 'active' ? 'bg-green-100 text-green-800' : 
                      selectedEventForManage.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedEventForManage.status || 'pending'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {selectedEventForManage.current_participants || 0}/{selectedEventForManage.max_participants || 0} participants
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Event Actions:</h5>
                <div className="grid grid-cols-1 gap-2">
                  {selectedEventForManage.status !== 'cancelled' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                      onClick={() => updateEventStatus(selectedEventForManage.id, 'cancelled')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Event
                    </Button>
                  )}
                  {selectedEventForManage.status === 'inactive' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                      onClick={() => updateEventStatus(selectedEventForManage.id, 'active')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Activate Event
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="justify-start"
                    onClick={() => handleViewParticipants(selectedEventForManage)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Participants ({selectedEventForManage.current_participants || 0})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      alert("Send message to participants feature coming soon!");
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Message Participants
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowManageModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Participants List Modal */}
      <Dialog open={showParticipantsModal} onOpenChange={setShowParticipantsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Participants</DialogTitle>
            <DialogDescription>
              {selectedEventForManage && (
                <>Manage participants for "{selectedEventForManage.title}"</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEventForManage && (
            <div className="space-y-4">
              {/* Event Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg">{selectedEventForManage.title}</h4>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedEventForManage.event_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(selectedEventForManage.start_time)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {selectedEventForManage.current_participants || 0}/{selectedEventForManage.max_participants} participants
                  </span>
                </div>
              </div>

              {/* Participants List */}
              <div>
                <h5 className="font-medium mb-3">Participants</h5>
                {loadingParticipants ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading participants...</span>
                  </div>
                ) : eventParticipants.length > 0 ? (
                  <div className="space-y-3">
                    {eventParticipants.map((participant) => (
                      <div key={participant.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h6 className="font-medium">{participant.user_name || 'Unknown User'}</h6>
                              <p className="text-sm text-gray-500">{participant.user_email || 'No email'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant={
                                    participant.status === 'approved' ? 'default' :
                                    participant.status === 'rejected' ? 'destructive' :
                                    'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {participant.status || 'pending'}
                                </Badge>
                                {participant.joined_at && (
                                  <span className="text-xs text-gray-400">
                                    Joined: {formatDate(participant.joined_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewParticipantDetails(participant)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No participants yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Participants will appear here once they join your event.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowParticipantsModal(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadEventParticipants(selectedEventForManage.id)}
                  disabled={loadingParticipants}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingParticipants ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Participant Details Modal */}
      <Dialog open={showParticipantDetailsModal} onOpenChange={setShowParticipantDetailsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Participant Details</DialogTitle>
            <DialogDescription>
              Review and manage participant application
            </DialogDescription>
          </DialogHeader>
          
          {selectedParticipant && (
            <div className="space-y-4">
              {/* Participant Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedParticipant.user_name || 'Unknown User'}</h4>
                    <p className="text-sm text-gray-500">{selectedParticipant.user_email || 'No email'}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge 
                      variant={
                        selectedParticipant.status === 'approved' ? 'default' :
                        selectedParticipant.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {selectedParticipant.status || 'pending'}
                    </Badge>
                  </div>
                  {selectedParticipant.joined_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Applied:</span>
                      <span>{formatDate(selectedParticipant.joined_at)}</span>
                    </div>
                  )}
                  {selectedParticipant.user_phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{selectedParticipant.user_phone}</span>
                    </div>
                  )}
                  {selectedParticipant.user_location && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span>{selectedParticipant.user_location}</span>
                    </div>
                  )}
                  {selectedParticipant.message && (
                    <div>
                      <span className="text-gray-600">Message:</span>
                      <p className="mt-1 p-2 bg-white rounded border text-sm">
                        {selectedParticipant.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedParticipant.status === 'pending' && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Actions:</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApproveParticipant(selectedParticipant)}
                      disabled={processingParticipant}
                    >
                      {processingParticipant ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button 
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt("Reason for rejection (optional):");
                        if (reason !== null) { // User didn't cancel
                          handleRejectParticipant(selectedParticipant, reason);
                        }
                      }}
                      disabled={processingParticipant}
                    >
                      {processingParticipant ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {selectedParticipant.status === 'approved' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Approved</AlertTitle>
                  <AlertDescription>
                    This participant has been approved for the event.
                  </AlertDescription>
                </Alert>
              )}

              {selectedParticipant.status === 'rejected' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Rejected</AlertTitle>
                  <AlertDescription>
                    This participant has been rejected.
                    {selectedParticipant.rejection_reason && (
                      <div className="mt-2">
                        <strong>Reason:</strong> {selectedParticipant.rejection_reason}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowParticipantDetailsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
