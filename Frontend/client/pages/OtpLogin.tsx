import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  LogIn,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "@/services/api";

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

export default function OtpLogin() {
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otpMethod, setOtpMethod] = useState<'email' | 'mobile'>('email');
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState("");
  const [otpId, setOtpId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isLoadingMethod, setIsLoadingMethod] = useState(true);
  const [userExists, setUserExists] = useState(false);
  const navigate = useNavigate();

  // Load OTP method from admin settings
  useEffect(() => {
    const loadOtpMethod = async () => {
      try {
        setIsLoadingMethod(true);
        const method = await apiService.getOtpMethod();
        setOtpMethod(method as 'email' | 'mobile');
      } catch (error) {
        console.error('Failed to load OTP method:', error);
        setOtpMethod('email'); // Default to email
      } finally {
        setIsLoadingMethod(false);
      }
    };

    loadOtpMethod();
  }, []);

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      let response;
      
      if (otpMethod === 'email') {
        response = await apiService.sendEmailOtp(email);
      } else {
        response = await apiService.sendMobileOtp(mobile, countryCode);
      }
      
      if (response.success) {
        setOtpId(response.otp_id);
        setUserExists(response.user_exists || false);
        setStep('otp');
        
        if (response.user_exists) {
          setSuccess(`Welcome back! OTP sent to your ${otpMethod === 'email' ? 'email' : 'mobile number'} for login.`);
        } else {
          setSuccess(`OTP sent successfully to your ${otpMethod === 'email' ? 'email' : 'mobile number'}!`);
        }
        
        startCountdown();
      } else {
        setError(response.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Send OTP error:", error);
      setError(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let response;
      
      if (otpMethod === 'email') {
        response = await apiService.verifyEmailOtp({
          email,
          otp,
          otp_id: otpId!,
          first_name: firstName,
          last_name: lastName,
        });
      } else {
        response = await apiService.verifyMobileOtp({
          mobile: countryCode + mobile,
          otp,
          otp_id: otpId!,
          first_name: firstName,
          last_name: lastName,
        });
      }
      
      if (response.success) {
        const token = response.access_token;
        const user = response.user;
        
        if (token && user) {
          // Set user login state in localStorage
          localStorage.setItem("userLoggedIn", "true");
          localStorage.setItem("userToken", token);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("userName", `${user.first_name} ${user.last_name}`);
          
          if (response.is_new_user) {
            setSuccess("Welcome! Your account has been created successfully.");
            // Redirect to profile completion or dashboard
            setTimeout(() => navigate("/user-profile"), 2000);
          } else {
            setSuccess("Login successful! Welcome back.");
            setTimeout(() => navigate("/user-dashboard"), 2000);
          }
        } else {
          setError("Invalid response from server.");
        }
      } else {
        setError(response.message || "Invalid OTP");
      }
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      setError(error.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      let response;
      
      if (otpMethod === 'email') {
        response = await apiService.resendEmailOtp(email);
      } else {
        response = await apiService.resendMobileOtp(countryCode + mobile);
      }
      
      if (response.success) {
        setOtpId(response.otp_id);
        setUserExists(response.user_exists || false);
        
        if (response.user_exists) {
          setSuccess(`New OTP sent to your ${otpMethod === 'email' ? 'email' : 'mobile number'} for login.`);
        } else {
          setSuccess(`New OTP sent successfully to your ${otpMethod === 'email' ? 'email' : 'mobile number'}!`);
        }
        
        startCountdown();
      } else {
        setError(response.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      setError(error.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToInput = () => {
    setStep('input');
    setOtp("");
    setError("");
    setSuccess("");
    setCountdown(0);
    setUserExists(false);
  };

  if (isLoadingMethod) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
          <span className="text-lg text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  User Login
                </span>
                <p className="text-sm text-gray-600">Share2care Foundation</p>
              </div>
            </Link>
            <Link to="/">
              <Button
                variant="outline"
                className="border-green-300 text-green-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Login Card */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {step === 'input' ? (
                otpMethod === 'email' ? (
                  <Mail className="w-8 h-8 text-white" />
                ) : (
                  <Phone className="w-8 h-8 text-white" />
                )
              ) : (
                <CheckCircle className="w-8 h-8 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {step === 'input' 
                ? `Login with ${otpMethod === 'email' ? 'Email' : 'Mobile'}` 
                : 'Verify OTP'
              }
            </CardTitle>
            <CardDescription>
              {step === 'input' 
                ? `Enter your ${otpMethod === 'email' ? 'email address' : 'mobile number'} to receive a verification code`
                : `We've sent a 6-digit code to your ${otpMethod === 'email' ? 'email' : 'mobile number'}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800 mb-1">Success!</h4>
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-1">Error</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Input Step */}
            {step === 'input' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {otpMethod === 'email' ? (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      We'll send a verification code to this email
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <div className="flex space-x-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                        required
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      We'll send a verification code via SMS
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {otpMethod === 'email' ? (
                        <Mail className="w-4 h-4 mr-2" />
                      ) : (
                        <Phone className="w-4 h-4 mr-2" />
                      )}
                      Send Verification Code
                    </div>
                  )}
                </Button>
              </form>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Check your {otpMethod === 'email' ? 'email' : 'SMS messages'} for the verification code
                  </p>
                </div>

                {/* Name fields for new users or existing users */}
                {!userExists ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Complete Your Profile
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="firstName" className="text-xs">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Please provide your name to create your account
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">
                      Welcome Back!
                    </h4>
                    <p className="text-sm text-green-700">
                      We found your existing account. You'll be logged in after OTP verification.
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="space-y-1">
                        <Label htmlFor="firstName" className="text-xs">First Name (Optional)</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Update first name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lastName" className="text-xs">Last Name (Optional)</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Update last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      You can update your name if needed
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <LogIn className="w-4 h-4 mr-2" />
                      Verify & Login
                    </div>
                  )}
                </Button>

                {/* Resend OTP */}
                <div className="flex items-center justify-between text-sm">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToInput}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Change {otpMethod === 'email' ? 'Email' : 'Mobile'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || isLoading}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {countdown > 0 ? (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Resend in {countdown}s
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Resend Code
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Method Info */}
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                {otpMethod === 'email' ? 'Email' : 'SMS'} Authentication Enabled
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}