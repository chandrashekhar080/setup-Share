import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ArrowLeft,
  Phone,
  User,
  Calendar,
  Mail,
  MapPin,
  FileText,
  Shield,
  Upload,
  CheckCircle,
  AlertCircle,
  MailIcon,
  GoalIcon,
  PhoneIcon,
  Loader2,
} from "lucide-react";
import Share2Care from "../../public/Images/logo-Share2Care.png";

import { Link } from "react-router-dom";
import { FaFacebook, FaTelegram, FaTwitter, FaYoutube } from "react-icons/fa";
import Header, { HeaderPart } from "../components/Layout/Header";
import apiService from "../services/api";
import { useToast } from "@/components/ui/use-toast";

// Country codes for mobile OTP
const countryCodes = [
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+7", country: "Russia" },
  { code: "+55", country: "Brazil" },
  { code: "+52", country: "Mexico" },
  { code: "+61", country: "Australia" },
  { code: "+82", country: "South Korea" },
  { code: "+65", country: "Singapore" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+20", country: "Egypt" },
  { code: "+27", country: "South Africa" },
  { code: "+234", country: "Nigeria" },
];

export default function User() {
  const { toast } = useToast();
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpId, setOtpId] = useState<number | null>(null);

  // OTP method state
  const [otpMethod, setOtpMethod] = useState<"email" | "mobile">("email");
  const [isLoadingMethod, setIsLoadingMethod] = useState(true);
  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  // Load OTP method from admin settings
  useEffect(() => {
    const loadOtpMethod = async () => {
      try {
        setIsLoadingMethod(true);
        const method = await apiService.getOtpMethod();
        setOtpMethod(method as "email" | "mobile");
      } catch (error) {
        console.error("Failed to load OTP method:", error);
        setOtpMethod("email"); // Default to email
      } finally {
        setIsLoadingMethod(false);
      }
    };

    loadOtpMethod();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const [step, setStep] = useState<"login" | "profile" | "additional" | "kyc">(
    "login",
  );
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [email, setemail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    email: "",
    houseNo: "",
    locality: "",
    city: "",
    pinCode: "",
    photo: null,
    education: "",
    specialization: "",
    profession: "",
    selectedSkills: [] as string[],
    bloodGroup: "",
    diseases: [] as string[],
    doc1Type: "",
    doc1Number: "",
    doc1File: null as File | null,
    doc2Type: "",
    doc2Number: "",
    doc2File: null as File | null,
    emergencyName: "",
    emergencyRelation: "",
    emergencyContact: "",
  });

  // Form options from API
  const [formOptions, setFormOptions] = useState<{
    education: Array<{ id: number; name: string; value: string }>;
    skills: Array<{ id: number; name: string; value: string }>;
    diseases: Array<{ id: number; name: string; value: string }>;
    documents: Array<{ id: number; name: string; value: string }>;
  }>({
    education: [],
    skills: [],
    diseases: [],
    documents: [],
  });

  const [errorFields, setErrorFields] = useState([]);

  // Load form options from API
  useEffect(() => {
    const loadFormOptions = async () => {
      try {
        console.log("Loading form options from API...");
        const response = await apiService.getAllFormOptions();
        console.log("Form options API response:", response);

        if (response.success && response.data) {
          setFormOptions(response.data);
          console.log("Form options loaded successfully:", response.data);
        } else {
          console.warn("API response not successful or no data:", response);
          throw new Error("Invalid API response");
        }
      } catch (error) {
        console.error("Failed to load form options:", error);
        // Fallback to hardcoded options if API fails
        setFormOptions({
          education: [
            { id: 1, name: "Doctorate", value: "doctorate" },
            { id: 2, name: "Post Graduate", value: "post-graduate" },
            { id: 3, name: "Graduate", value: "graduate" },
            { id: 4, name: "Non-graduate", value: "non-graduate" },
            {
              id: 5,
              name: "Professional (Engineer/Doctor/MBA/Law)",
              value: "professional-engineer-doctor-mba-law",
            },
          ],
          skills: [
            {
              id: 1,
              name: "Artistic activities – Painting/Graphic design/Sketching",
              value: "artistic-activities",
            },
            {
              id: 2,
              name: "Community/Social service",
              value: "community-social-service",
            },
            { id: 3, name: "Cooking or baking", value: "cooking-or-baking" },
            { id: 4, name: "Healthcare", value: "healthcare" },
            {
              id: 5,
              name: "Playing a musical instrument",
              value: "playing-a-musical-instrument",
            },
            {
              id: 6,
              name: "Games/Sports (Chess/Board Games/Cards)",
              value: "games-sports",
            },
            {
              id: 7,
              name: "Outdoor games (Tennis/Squash/Golf)",
              value: "outdoor-games",
            },
            { id: 8, name: "Cycling/Swimming", value: "cycling-swimming" },
            { id: 9, name: "Photography", value: "photography" },
            { id: 10, name: "Blog Writing", value: "blog-writing" },
            {
              id: 11,
              name: "Religious Discussions",
              value: "religious-discussions",
            },
            {
              id: 12,
              name: "Political discussions",
              value: "political-discussions",
            },
            { id: 13, name: "Exploring Culture", value: "exploring-culture" },
            { id: 14, name: "Dancing", value: "dancing" },
            { id: 15, name: "Charity", value: "charity" },
            { id: 16, name: "Stand-up Comedy", value: "stand-up-comedy" },
            { id: 17, name: "Journalism", value: "journalism" },
            { id: 18, name: "Gardening", value: "gardening" },
            { id: 19, name: "Farming", value: "farming" },
            { id: 20, name: "Calligraphy", value: "calligraphy" },
            {
              id: 21,
              name: "Yoga and Nature Cure",
              value: "yoga-and-nature-cure",
            },
            {
              id: 22,
              name: "Quiz, Crossword puzzles",
              value: "quiz-crossword-puzzles",
            },
            {
              id: 23,
              name: "Antakshari, Tambola",
              value: "antakshari-tambola",
            },
            {
              id: 24,
              name: "Meditation, Wellness",
              value: "meditation-wellness",
            },
            {
              id: 25,
              name: "Devotional Discussions",
              value: "devotional-discussions",
            },
            {
              id: 26,
              name: "Indian Festivals, Songs",
              value: "indian-festivals-songs",
            },
            { id: 27, name: "Mindful Morning", value: "mindful-morning" },
            { id: 28, name: "Any Other", value: "any-other" },
          ],
          diseases: [
            { id: 1, name: "Asthma", value: "asthma" },
            { id: 2, name: "Blood Pressure", value: "blood-pressure" },
            { id: 3, name: "Cancer", value: "cancer" },
            { id: 4, name: "Diabetes", value: "diabetes" },
            { id: 5, name: "Heart Diseases", value: "heart-diseases" },
            { id: 6, name: "PCOD", value: "pcod" },
            {
              id: 7,
              name: "Chronic Obstructive Pulmonary Disease (COPD)",
              value: "chronic-obstructive-pulmonary-disease-copd",
            },
            { id: 8, name: "TB", value: "tb" },
          ],
          documents: [
            { id: 1, name: "Aadhar Card", value: "aadhar" },
            { id: 2, name: "Voter ID", value: "voter" },
            { id: 3, name: "Passport", value: "passport" },
            { id: 4, name: "Driving License", value: "driving" },
          ],
        });
      }
    };

    loadFormOptions();
  }, []);

  // Handle resend timer countdown
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Handle OTP sending
  const handleSendOTP = async () => {
    if (!termsAccepted) {
      setError("Please accept terms and conditions");
      return;
    }

    if (otpMethod === "email") {
      if (!email) {
        setError("Please enter a valid email");
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return;
      }
    } else {
      if (!mobile) {
        setError("Please enter a valid mobile number");
        return;
      }
      if (mobile.length < 10) {
        setError("Please enter a valid mobile number");
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      let response;

      if (otpMethod === "email") {
        response = await apiService.sendEmailOtp(email);
      } else {
        response = await apiService.sendMobileOtp(mobile, countryCode);
      }

      if (response.success) {
        setOtpSent(true);
        setOtpId(response.otp_id);
        setResendTimer(30); // 30-second cooldown
        setError("");
      } else {
        setError(response.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Send OTP error:", error);
      setError(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle resend
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setError("");

    try {
      let response;

      if (otpMethod === "email") {
        response = await apiService.resendEmailOtp(email);
      } else {
        response = await apiService.resendMobileOtp(countryCode + mobile);
      }

      if (response.success) {
        setOtpId(response.otp_id);
        setResendTimer(30);
        setError("");
        console.log(
          "OTP resent to",
          otpMethod === "email" ? email : countryCode + mobile,
        );
      } else {
        setError(response.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      setError(error.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification - moved to later in file to avoid duplication

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // const handleSendOTP = () => {
  //   if (email.length !== 10) {
  //     alert("Email must be exactly 10 digits");
  //     return;
  //   }
  //   setOtpSent(true);
  // };

  const handleSubmitProfile = async () => {
    // Comprehensive validation
    const requiredFields = [
      { field: "title", name: "Title" },
      { field: "firstName", name: "First Name" },
      { field: "lastName", name: "Last Name" },
      { field: "gender", name: "Gender" },
      { field: "dob", name: "Date of Birth" },
      { field: "houseNo", name: "House Number" },
      { field: "locality", name: "Locality" },
      { field: "city", name: "City" },
      { field: "pinCode", name: "Pin Code" },
      { field: "education", name: "Education" },
      { field: "profession", name: "Profession" },
      { field: "bloodGroup", name: "Blood Group" },
      { field: "doc1Type", name: "Document 1 Type" },
      { field: "doc1Number", name: "Document 1 Number" },
      { field: "doc1File", name: "Document 1 File" },
      { field: "doc2Type", name: "Document 2 Type" },
      { field: "doc2Number", name: "Document 2 Number" },
      { field: "doc2File", name: "Document 2 File" },
      { field: "emergencyName", name: "Emergency Contact Name" },
      { field: "emergencyRelation", name: "Emergency Contact Relation" },
      { field: "emergencyContact", name: "Emergency Contact Number" },
    ];

    const missingFields = requiredFields.filter(({ field }) => {
      const value = formData[field];
      return !value || (Array.isArray(value) && value.length === 0);
    });

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(({ name }) => name).join(", ");
      setError(`Please fill in all required fields: ${fieldNames}`);
      return;
    }

    // Validate skills selection
    if (!formData.selectedSkills || formData.selectedSkills.length === 0) {
      setError("Please select at least one skill.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.emergencyContact)) {
      setError("Please enter a valid 10-digit emergency contact number.");
      return;
    }

    // Validate pin code format
    const pinCodeRegex = /^[0-9]{6}$/;
    if (!pinCodeRegex.test(formData.pinCode)) {
      setError("Please enter a valid 6-digit pin code.");
      return;
    }

    // Validate file types and sizes
    const allowedFileTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (formData.doc1File) {
      if (!allowedFileTypes.includes(formData.doc1File.type)) {
        setError("Document 1 must be a PDF, JPG, JPEG, or PNG file.");
        return;
      }
      if (formData.doc1File.size > maxFileSize) {
        setError("Document 1 file size must be less than 5MB.");
        return;
      }
    }

    if (formData.doc2File) {
      if (!allowedFileTypes.includes(formData.doc2File.type)) {
        setError("Document 2 must be a PDF, JPG, JPEG, or PNG file.");
        return;
      }
      if (formData.doc2File.size > maxFileSize) {
        setError("Document 2 file size must be less than 5MB.");
        return;
      }
    }

    if (formData.photo) {
      const photoTypes = ["image/jpeg", "image/jpg", "image/png"];
      const maxPhotoSize = 2 * 1024 * 1024; // 2MB

      if (!photoTypes.includes(formData.photo.type)) {
        setError("Photo must be a JPG, JPEG, or PNG file.");
        return;
      }
      if (formData.photo.size > maxPhotoSize) {
        setError("Photo file size must be less than 2MB.");
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      // Prepare FormData for file upload
      const submitData = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            // Handle arrays (skills, diseases)
            value.forEach((item, index) => {
              submitData.append(`${key}[${index}]`, item);
            });
          } else if (value instanceof File) {
            // Handle file uploads
            submitData.append(key, value);
          } else {
            // Handle regular fields
            submitData.append(key, value.toString());
          }
        }
      });

      // Add email
      submitData.append("email", email);

      // Submit profile to API
      const response = await apiService.submitUserProfile(submitData);

      if (response.success) {
        // Store submission status locally
        localStorage.setItem("userProfileSubmitted", "true");
        localStorage.setItem("userSubmissionDate", new Date().toISOString());

        // Update user data in localStorage to reflect completed profile
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

        // Create a serializable version of formData (without File objects)
        const serializableFormData = { ...formData };

        // Replace File objects with file information
        if (formData.photo instanceof File) {
          serializableFormData.photo = formData.photo.name;
          serializableFormData.photoUploaded = true;
        }
        if (formData.doc1File instanceof File) {
          serializableFormData.doc1File = formData.doc1File.name;
          serializableFormData.doc1FileUploaded = true;
        }
        if (formData.doc2File instanceof File) {
          serializableFormData.doc2File = formData.doc2File.name;
          serializableFormData.doc2FileUploaded = true;
        }

        const updatedUser = {
          ...currentUser,
          others: JSON.stringify(serializableFormData), // Store the serializable form data
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: email,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // If API response contains updated user data, use that instead
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
        }

        // Try to refresh user data from server to ensure consistency
        try {
          const userProfileResponse = await apiService.getUserProfileDetails(
            currentUser.id,
          );
          if (userProfileResponse) {
            // Update localStorage with fresh data from server
            const refreshedUser = {
              ...currentUser,
              ...userProfileResponse,
              others: userProfileResponse.others || JSON.stringify(formData),
            };
            localStorage.setItem("user", JSON.stringify(refreshedUser));
          }
        } catch (error) {
          console.log(
            "Could not refresh user data from server, using local data",
          );
        }

        // Show success message
        toast({
          title: "Profile submitted successfully!",
          description: `Your details:
- Name: ${formData.title} ${formData.firstName} ${formData.lastName}
- Email: ${email}
- Submitted on: ${new Date().toLocaleDateString()}

Your registration will be approved by admin within 48 hours. You will receive an email notification once approved.`,
          variant: "default",
        });

        // Redirect to a pending approval page or dashboard
        setTimeout(() => {
          window.location.href = "/user-dashboard";
        }, 3000);
      } else {
        setError(
          response.message || "Failed to submit profile. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Submit profile error:", error);
      setError(error.message || "Failed to submit profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if user profile is completed
  const checkProfileCompletion = async (user) => {
    try {
      console.log("Checking profile completion for user:", user);

      // Check if user has completed profile data in 'others' field
      if (!user.others) {
        console.log("User.others is missing or empty");
        return false;
      }

      const profileData =
        typeof user.others === "string" ? JSON.parse(user.others) : user.others;
      console.log("Profile data parsed:", profileData);

      // Check for essential profile completion fields
      const requiredFields = [
        "title",
        "firstName",
        "lastName",
        "gender",
        "dob",
        "houseNo",
        "locality",
        "city",
        "pinCode",
        "education",
        "profession",
        "bloodGroup",
        "doc1Type",
        "doc1Number",
        "doc1File",
        "doc2Type",
        "doc2Number",
        "doc2File",
        "emergencyName",
        "emergencyRelation",
        "emergencyContact",
      ];

      // Photo is optional, so we don't include it in required fields

      const missingFields = requiredFields.filter((field) => {
        const value = profileData[field];

        // Special handling for file fields - they might be stored as file names or upload flags
        if (field.includes("File")) {
          // For file fields, check if there's a corresponding upload flag or filename
          const uploadedFlag = field + "Uploaded";
          const hasFile =
            value ||
            profileData[uploadedFlag] ||
            (typeof value === "string" && value.length > 0);
          return !hasFile;
        }

        return !value || (Array.isArray(value) && value.length === 0);
      });

      // Also check if skills are selected
      if (
        !profileData.selectedSkills ||
        profileData.selectedSkills.length === 0
      ) {
        missingFields.push("selectedSkills");
      }

      // If there are missing fields, profile is not complete
      if (missingFields.length > 0) {
        console.log("Profile is incomplete. Missing fields:", missingFields);

        // Pre-fill existing data if available
        if (profileData) {
          setFormData((prev) => ({
            ...prev,
            ...profileData,
            email: user.email || email,
          }));
        }

        return false;
      }

      console.log("Profile is complete! All required fields are present.");

      return true;
    } catch (error) {
      console.error("Error checking profile completion:", error);
      return false;
    }
  };

  // Check user approval status
  const checkUserApprovalStatus = async () => {
    const userToken = localStorage.getItem("userToken");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!userToken || !user.id) {
      return;
    }

    try {
      const response = await apiService.getUserApprovalStatus(user.id);

      if (response.success) {
        const { status, approval_status } = response.data;

        if (status === "rejected" || approval_status === "rejected") {
          toast({
            title: "Profile Rejected",
            description:
              "Your profile has been rejected by admin. Please contact support for more information or wait for 48 hours before resubmitting.",
            variant: "destructive",
          });
          return false;
        } else if (status === "pending" || approval_status === "pending") {
          toast({
            title: "Profile Under Review",
            description:
              "Your profile is still under review. Please wait for admin approval within 48 hours.",
            variant: "default",
          });
          return false;
        } else if (status === "approved" || approval_status === "approved") {
          return true;
        }
      }
    } catch (error) {
      console.error("Error checking approval status:", error);
    }

    return false;
  };

  // Handle dashboard access
  const handleDashboardAccess = async () => {
    const isApproved = await checkUserApprovalStatus();

    if (isApproved) {
      window.location.href = "/user-dashboard";
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    const userLoggedIn = localStorage.getItem("userLoggedIn");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (userToken && userLoggedIn === "true" && user.id) {
      // If user is already logged in, first check if profile is completed
      checkProfileCompletion(user).then((isCompleted) => {
        if (!isCompleted) {
          // Profile not completed, show profile form
          setStep("profile");
          setemail(user.email || "");
          // Pre-fill existing data if available
          if (user.others) {
            try {
              const existingData =
                typeof user.others === "string"
                  ? JSON.parse(user.others)
                  : user.others;
              setFormData((prev) => ({
                ...prev,
                ...existingData,
                email: user.email || "",
                firstName: user.first_name || existingData.firstName || "",
                lastName: user.last_name || existingData.lastName || "",
              }));
            } catch (error) {
              console.error("Error parsing existing profile data:", error);
              setFormData((prev) => ({
                ...prev,
                email: user.email || "",
                firstName: user.first_name || "",
                lastName: user.last_name || "",
              }));
            }
          } else {
            setFormData((prev) => ({
              ...prev,
              email: user.email || "",
              firstName: user.first_name || "",
              lastName: user.last_name || "",
            }));
          }
        } else {
          // Profile is completed, check approval status before redirecting to dashboard
          checkUserApprovalStatus().then((isApproved) => {
            if (isApproved) {
              // User is approved, redirect to dashboard
              window.location.href = "/user-dashboard";
            } else {
              // Profile completed but not approved yet, stay on user page to show status
              console.log("Profile completed but user not approved yet");
            }
          });
        }
      });
    }
  }, []);

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter((s) => s !== skill)
        : [...prev.selectedSkills, skill],
    }));
  };

  const handleDiseaseToggle = (disease: string) => {
    setFormData((prev) => ({
      ...prev,
      diseases: prev.diseases.includes(disease)
        ? prev.diseases.filter((d) => d !== disease)
        : [...prev.diseases, disease],
    }));
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6 || !otpId) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let response;

      if (otpMethod === "email") {
        response = await apiService.verifyEmailOtp({
          email,
          otp,
          otp_id: otpId,
        });
      } else {
        response = await apiService.verifyMobileOtp({
          mobile: countryCode + mobile,
          otp,
          otp_id: otpId,
        });
      }

      if (response.success) {
        // Store user token and info for both new and existing users
        localStorage.setItem("userToken", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));
        if (otpMethod === "email") {
          localStorage.setItem("userEmail", email);
        } else {
          localStorage.setItem("userMobile", countryCode + mobile);
        }
        localStorage.setItem("userLoggedIn", "true");

        if (response.is_new_user) {
          // New user - needs to complete profile
          setIsExistingUser(false);
          setStep("profile");
          setOtp("");
          setFormData((prev) => ({
            ...prev,
            email: otpMethod === "email" ? email : response.user.email || "",
            firstName: response.user.first_name || "",
            lastName: response.user.last_name || "",
          }));
        } else {
          // Existing user - check if profile is completed
          const profileCompleted = response.profile_completed;

          if (!profileCompleted) {
            // Profile not completed - redirect to profile form
            setIsExistingUser(true);
            setStep("profile");
            setOtp("");
            // Pre-fill existing data if available
            if (response.user.others) {
              try {
                const existingData =
                  typeof response.user.others === "string"
                    ? JSON.parse(response.user.others)
                    : response.user.others;
                setFormData((prev) => ({
                  ...prev,
                  ...existingData,
                  email:
                    otpMethod === "email" ? email : existingData.email || "",
                  firstName:
                    response.user.first_name || existingData.firstName || "",
                  lastName:
                    response.user.last_name || existingData.lastName || "",
                }));
              } catch (error) {
                console.error("Error parsing existing profile data:", error);
                setFormData((prev) => ({
                  ...prev,
                  email,
                  firstName: response.user.first_name || "",
                  lastName: response.user.last_name || "",
                }));
              }
            } else {
              setFormData((prev) => ({
                ...prev,
                email,
                firstName: response.user.first_name || "",
                lastName: response.user.last_name || "",
              }));
            }
            toast({
              title: "Profile Incomplete",
              description:
                "Please complete your profile to access the dashboard.",
              variant: "default",
            });
          } else {
            // Profile completed - check approval status before redirecting
            const isApproved = await checkUserApprovalStatus();
            if (isApproved) {
              window.location.href = "/user-dashboard";
            }
          }
        }
      } else {
        setError(response.message || "Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      setError(error.message || "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const relationships = [
    "Spouse",
    "Son",
    "Daughter",
    "Son-in-Law",
    "Daughter-in-law",
    "Friend",
    "Brother",
    "Sister",
    "Mother",
    "Father",
    "Mother-in-Law",
    "Father-in-Law",
    "Sister-in-Law",
    "Brother-in-Law",
    "Others",
  ];

  const processFlowItems = [
    "On our website, login as user by providing your mobile number and verify through OTP.",
    "On verification, submit your profile details and upload softcopy of 2 ID cards and your photo.",
    "On submitting details, you will receive a welcome SMS/email.",
    "Now, you are ready to create an event or join the forthcoming events.",
    "You can initiate an event of your choice by selecting an activity and providing date and time of event, you wish to organise.",
    "Please note, not more than 2 events can be created and execution time for any events shall be within 7 days.",
    "Your event details will be sent by SMS, to the members having same interest.",
    "Also, your proposed event details will be available as 'Future Event' for others to join.",
    "On receipt of request from interested guests, you can select required guest member(s).",
    "Subsequently, mobile numbers shall be exchanged between you and selected members.",
    "Thereafter, the guest member(s) shall visit your place for the event. On completion of the activity, both you and guest(s) members shall 'Close' the event on the website.",
    "Till event has not been closed by both of you, it will not be allowed to create new event or join events created by others.",
    "You may be happy with this time-sharing session.",
    "There is provision to leave a message for Admin, if you need any support.",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Share2care Header */}
      <div className="fixed w-screen z-50">
        <Header/>
        {/* Navigation */}
        {/* <nav className="share2care-nav sticky top-0 z-50 shadow-sm">
          <div className="share2care-nav max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 max-md:p-4">
              <Link
                to="/"
                className="flex items-center hover:opacity-90 transition-opacity"
              >
                <img
                  src={Share2Care}
                  alt="Share2Care"
                  className="max-lg:w-20 max-w-32"
                />
              </Link>
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
        </nav> */}
      </div>
      <div className="max-w-7xl flex mx-auto max-md:flex-col gap-5 px-4 sm:px-6 lg:px-8 py-8 max-md:px-8 max-md:overflow-hidden z-30">
        <div className="space-y-2 mt-36 max-md:w-full w-3/6 border p-5 rounded-2xl">
          <h3 className="font-bold text-2xl text-center text-share2care-red">
            Process Flow
          </h3>

          <ol className="space-y-2 text-sm text-gray-700">
            {processFlowItems.map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="font-medium">{index + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>

        {step === "login" && (
          <Card className="max-w-md mx-auto mt-36 max-md:mt-5">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Welcome to User’s profile
              </CardTitle>
              <CardDescription>
                {isLoadingMethod
                  ? "Loading..."
                  : !otpSent
                    ? `Enter your ${otpMethod === "email" ? "Email" : "Mobile Number"} to get started`
                    : `Enter the OTP sent to your ${otpMethod === "email" ? "Email" : "Mobile Number"}`}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
              <>
                {/* Demo Credentials */}
                {!isLoadingMethod && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2 flex">
                      <GoalIcon className="w-5 h-5 mr-2" />
                      Information:
                    </h4>
                    <p className="text-sm text-blue-700 mb-2">
                      <strong>
                        {otpMethod === "email" ? "Email" : "Mobile"}:
                      </strong>{" "}
                      Enter any valid{" "}
                      {otpMethod === "email"
                        ? "email address"
                        : "mobile number"}
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>OTP:</strong> Will be sent to your{" "}
                      {otpMethod === "email"
                        ? "email address"
                        : "mobile number"}
                    </p>
                  </div>
                )}
                {/* Terms Notice */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-medium text-share2care-red mb-2">
                    Important Terms: You agree that –
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• High moral and integrity shall be maintained.</li>
                    <li>• There will be no financial involvement.</li>
                    <li>
                      • Share2care Foundation shall in no way be responsible for
                      any misconduct between guest(s) and host of meeting.
                    </li>
                  </ul>
                </div>
                {/* Dynamic Input - Email or Mobile */}
                {!isLoadingMethod && (
                  <div className="space-y-2">
                    <Label htmlFor={otpMethod === "email" ? "email" : "mobile"}>
                      {otpMethod === "email" ? "Email" : "Mobile Number"}
                    </Label>
                    {otpMethod === "email" ? (
                      <div className="flex">
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter Email"
                          value={email}
                          onChange={(e) => setemail(e.target.value)}
                          disabled={otpSent}
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Select
                          value={countryCode}
                          onValueChange={setCountryCode}
                          disabled={otpSent}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {countryCodes.map((country) => (
                              <SelectItem
                                key={country.code}
                                value={country.code}
                              >
                                {country.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          id="mobile"
                          type="tel"
                          placeholder="Enter Mobile Number"
                          value={mobile}
                          onChange={(e) =>
                            setMobile(e.target.value.replace(/\D/g, ""))
                          }
                          disabled={otpSent}
                          className="flex-1"
                        />
                      </div>
                    )}
                    {otpMethod === "email" &&
                      email.length > 0 &&
                      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Please enter a valid email address
                        </p>
                      )}
                    {otpMethod === "mobile" &&
                      mobile.length > 0 &&
                      mobile.length < 10 && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Please enter a valid mobile number
                        </p>
                      )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    disabled={!otpSent}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="text-center text-lg tracking-widest "
                  />
                  <button
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0 || loading}
                    className={`text-end w-full font-medium cursor-pointer text-sm tracking-[0.8px] ${
                      resendTimer > 0 || loading
                        ? "text-gray-400"
                        : "text-blue-600 hover:underline"
                    }`}
                  >
                    {loading
                      ? "Sending..."
                      : resendTimer > 0
                        ? `Resend in ${resendTimer}s`
                        : "Resend OTP"}
                  </button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {error}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I accept the{" "}
                    <Link
                      to="/terms"
                      className="text-share2care-red hover:underline"
                    >
                      Terms and Conditions
                    </Link>
                  </Label>
                </div>

                {!otpSent ? (
                  <div className="flex max-sm:flex-col gap-4">
                    <Button
                      onClick={handleSendOTP}
                      disabled={
                        isLoadingMethod ||
                        !termsAccepted ||
                        loading ||
                        (otpMethod === "email"
                          ? !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                          : !mobile || mobile.length < 10)
                      }
                      className="flex-1 btn-share2care"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : otpMethod === "email" ? (
                        <Mail className="w-4 h-4 mr-2" />
                      ) : (
                        <Phone className="w-4 h-4 mr-2" />
                      )}
                      {loading ? "Sending..." : "Send OTP"}
                    </Button>
                    <Link to="/">
                      <Button variant="outline" className="border-gray-300">
                        Exit
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <Button
                      onClick={handleVerifyOTP}
                      disabled={otp.length !== 6 || loading}
                      className="flex-1 btn-share2care"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {loading ? "Verifying..." : "Verify & Continue"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setOtpSent(false)}
                      className="border-gray-300"
                    >
                      Back
                    </Button>
                  </div>
                )}
              </>
            </CardContent>
          </Card>
        )}

        {step === "profile" && (
          <Card className="mt-36 max-md:mt-5">
            {/* Error Display */}
            {error && (
              <div className="mx-6 mt-6 mb-4 bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </p>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-2xl">
                User Profile – Basic details
              </CardTitle>
              <CardDescription>
                Please provide your basic information{" "}
                <span className="text-red-500">*</span> (Age must be 60+ years)
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
              {/* ERROR Message Display */}
              {errorFields.length > 0 && (
                <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
                  Please fill the following required field(s):{" "}
                  {errorFields.join(", ")}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label>
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.title}
                    onValueChange={(value) => handleInputChange("title", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mr">Mr.</SelectItem>
                      <SelectItem value="mrs">Mrs.</SelectItem>
                      <SelectItem value="dr">Dr.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gender */}
                <div className="space-y-2">
                  <Label>
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* DOB */}
                <div className="space-y-2">
                  <Label htmlFor="dob">
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    max={
                      new Date(Date.now() - 60 * 365.25 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0]
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Must be 60 years or older
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setemail(e.target.value)}
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photo">Upload Photo (optional)</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleInputChange("photo", e.target.files[0])
                  }
                />
              </div>

              {/* Address */}
              <div className="space-y-4">
                <Label>Address</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="House Number"
                    value={formData.houseNo}
                    onChange={(e) =>
                      handleInputChange("houseNo", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Locality"
                    value={formData.locality}
                    onChange={(e) =>
                      handleInputChange("locality", e.target.value)
                    }
                  />
                  <Input
                    placeholder="City *"
                    required
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                  <Input
                    placeholder="Pin Code *"
                    required
                    value={formData.pinCode}
                    onChange={(e) =>
                      handleInputChange("pinCode", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex max-sm:flex-col gap-4">
                <Button
                  type="submit"
                  onClick={() => {
                    // Validation
                    const missing = [];
                    if (!formData.title) missing.push("Title");
                    if (!formData.firstName) missing.push("First Name");
                    if (!formData.lastName) missing.push("Last Name");
                    if (!formData.gender) missing.push("Gender");
                    if (!formData.dob) missing.push("Date of Birth");
                    if (!formData.email) missing.push("Email ID");
                    if (!formData.city) missing.push("City");
                    if (!formData.pinCode) missing.push("Pin Code");

                    if (missing.length > 0) {
                      setErrorFields(missing);
                      return;
                    }

                    // Clear error and proceed
                    setErrorFields([]);
                    setStep("additional");
                  }}
                  className="btn-share2care"
                >
                  Continue to Additional Details
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setStep("login")}
                  className="border-gray-300"
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "additional" && (
          <Card className="mt-36 max-md:mt-5">
            <CardHeader>
              <CardTitle className="text-2xl">
                User Profile – Additional information
              </CardTitle>
              <CardDescription>
                Tell us more about your interests and professional background.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Educational Qualification</Label>
                  <Select
                    value={formData.education}
                    onValueChange={(value) =>
                      handleInputChange("education", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      {formOptions.education.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Any other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">
                    Specialisation (if any)
                  </Label>
                  <Input
                    id="specialization"
                    placeholder="Enter specialisation"
                    value={formData.specialization}
                    onChange={(e) =>
                      handleInputChange("specialization", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession">
                  Professional Career (Current/Past occupation)
                </Label>
                <Textarea
                  id="profession"
                  placeholder="Describe your professional background (2 lines)"
                  rows={3}
                  value={formData.profession}
                  onChange={(e) =>
                    handleInputChange("profession", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2 mt-6">
                <Label>Topics for meeting (your Interests/Hobbies)</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Select all that apply to you. List can be discussed and
                  refined.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {formOptions.skills.map((skill) => (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill.value}
                        checked={formData.selectedSkills.includes(skill.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleInputChange("selectedSkills", [
                              ...formData.selectedSkills,
                              skill.name,
                            ]);
                          } else {
                            handleInputChange(
                              "selectedSkills",
                              formData.selectedSkills.filter(
                                (s) => s !== skill.name,
                              ),
                            );
                          }
                        }}
                      />
                      <Label htmlFor={skill.value} className="text-sm">
                        {skill.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select
                    value={formData.bloodGroup}
                    onValueChange={(value) =>
                      handleInputChange("bloodGroup", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                        (group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Chronic Disease/Health Status</Label>
                  <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                    {formOptions.diseases.map((disease) => (
                      <div
                        key={disease.id}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <Checkbox
                          id={disease.value}
                          checked={formData.diseases.includes(disease.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange("diseases", [
                                ...formData.diseases,
                                disease.name,
                              ]);
                            } else {
                              handleInputChange(
                                "diseases",
                                formData.diseases.filter(
                                  (d) => d !== disease.name,
                                ),
                              );
                            }
                          }}
                        />
                        <Label htmlFor={disease.value} className="text-sm">
                          {disease.name}
                        </Label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="other-disease"
                        checked={formData.diseases.includes("Any other")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleInputChange("diseases", [
                              ...formData.diseases,
                              "Any other",
                            ]);
                          } else {
                            handleInputChange(
                              "diseases",
                              formData.diseases.filter(
                                (d) => d !== "Any other",
                              ),
                            );
                          }
                        }}
                      />
                      <Label htmlFor="other-disease" className="text-sm">
                        Any other
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 max-sm:flex-col">
                <Button
                  onClick={() => {
                    // Validate required fields
                    const missing = [];
                    if (!formData.education)
                      missing.push("Educational Qualification");
                    if (!formData.profession)
                      missing.push("Professional Career");
                    if (!formData.bloodGroup) missing.push("Blood Group");
                    if (
                      !formData.selectedSkills ||
                      formData.selectedSkills.length === 0
                    )
                      missing.push("Topics for meeting (select at least one)");

                    if (missing.length > 0) {
                      setError(
                        `Please fill in all required fields: ${missing.join(", ")}`,
                      );
                      return;
                    }

                    // Clear error and proceed
                    setError("");
                    setStep("kyc");
                  }}
                  className="btn-share2care"
                >
                  Continue to KYC
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep("profile")}
                  className="border-gray-300"
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "kyc" && (
          <Card className="mt-36 max-md:mt-5">
            <CardHeader>
              <CardTitle className="text-2xl">User Profile – KYC</CardTitle>
              <CardDescription>
                For providing a safe platform, identification is desirable.
                (Information shall be kept secret)
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Document 1 */}
                <div className="space-y-4">
                  <h4 className="font-medium">Document 1</h4>
                  <div className="space-y-2">
                    <Label>Document Name</Label>
                    <Select
                      value={formData.doc1Type}
                      onValueChange={(value) =>
                        handleInputChange("doc1Type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document" />
                      </SelectTrigger>
                      <SelectContent>
                        {formOptions.documents.map((doc) => (
                          <SelectItem key={doc.id} value={doc.value}>
                            {doc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc1-number">Document Number</Label>
                    <Input
                      id="doc1-number"
                      placeholder="Enter document number"
                      value={formData.doc1Number}
                      onChange={(e) =>
                        handleInputChange("doc1Number", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Upload Document</Label>

                    {/* Hidden input file */}
                    <input
                      type="file"
                      id="doc1-upload"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleInputChange("doc1File", file);
                        }
                      }}
                      className="hidden"
                    />

                    {/* Clickable upload area */}
                    <div
                      onClick={() =>
                        document.getElementById("doc1-upload")?.click()
                      }
                      className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      {formData?.doc1File && (
                        <p className="text-xs text-green-600 mt-2">
                          Selected: {formData.doc1File.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document 2 */}
                <div className="space-y-4">
                  <h4 className="font-medium">Document 2</h4>
                  <div className="space-y-2">
                    <Label>Document Name</Label>
                    <Select
                      value={formData.doc2Type}
                      onValueChange={(value) =>
                        handleInputChange("doc2Type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document" />
                      </SelectTrigger>
                      <SelectContent>
                        {formOptions.documents.map((doc) => (
                          <SelectItem key={doc.id} value={doc.value}>
                            {doc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc2-number">Document Number</Label>
                    <Input
                      id="doc2-number"
                      placeholder="Enter document number"
                      value={formData.doc2Number}
                      onChange={(e) =>
                        handleInputChange("doc2Number", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Upload Document</Label>

                    {/* Hidden input file */}
                    <input
                      type="file"
                      id="doc2-upload"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleInputChange("doc2File", file);
                        }
                      }}
                      className="hidden"
                    />

                    {/* Clickable upload area */}
                    <div
                      onClick={() =>
                        document.getElementById("doc2-upload")?.click()
                      }
                      className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      {formData?.doc2File && (
                        <p className="text-xs text-green-600 mt-2">
                          Selected: {formData.doc2File.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h4 className="font-medium">Emergency Contact Person</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency-name">Name</Label>
                    <Input
                      id="emergency-name"
                      placeholder="Contact person name"
                      value={formData.emergencyName}
                      onChange={(e) =>
                        handleInputChange("emergencyName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Select
                      value={formData.emergencyRelation}
                      onValueChange={(value) =>
                        handleInputChange("emergencyRelation", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationships.map((relation) => (
                          <SelectItem
                            key={relation}
                            value={relation.toLowerCase()}
                          >
                            {relation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency-contact">Contact Number</Label>
                    <Input
                      id="emergency-contact"
                      placeholder="Emergency contact number"
                      type="tel"
                      value={formData.emergencyContact}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContact",
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                {/* <h4 className="font-semibold text-green-800 text-lg mb-2"> */}
                {/* </h4> */}
                <p className="text-sm font-medium text-green-700 leading-relaxed">
                  What Next - On submission of your profile, you will get
                  confirmation message with in 48 hrs. <br /> Subsequently you
                  will enjoy creating events and participating in events created
                  by others.
                </p>
              </div>

              {/* Final Actions */}
              <div className="flex gap-4 max-sm:flex-col">
                <Button
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  onClick={() => {
                    // Validate KYC fields before submission
                    const missing = [];
                    if (!formData.doc1Type) missing.push("Document 1 Type");
                    if (!formData.doc1Number) missing.push("Document 1 Number");
                    if (!formData.doc1File) missing.push("Document 1 File");
                    if (!formData.doc2Type) missing.push("Document 2 Type");
                    if (!formData.doc2Number) missing.push("Document 2 Number");
                    if (!formData.doc2File) missing.push("Document 2 File");
                    if (!formData.emergencyName)
                      missing.push("Emergency Contact Name");
                    if (!formData.emergencyRelation)
                      missing.push("Emergency Contact Relationship");
                    if (!formData.emergencyContact)
                      missing.push("Emergency Contact Number");

                    if (missing.length > 0) {
                      setError(
                        `Please fill in all required KYC fields: ${missing.join(", ")}`,
                      );
                      return;
                    }

                    // Clear error and submit
                    setError("");
                    handleSubmitProfile();
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  {loading ? "Submitting..." : "Submit Profile for Review"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep("additional")}
                  className="border-gray-300"
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
