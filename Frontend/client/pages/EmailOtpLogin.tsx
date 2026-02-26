// This component is now replaced by the unified OtpLogin component
// Redirecting to maintain backward compatibility
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EmailOtpLogin() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the unified OTP login page
    navigate("/otp-login", { replace: true });
  }, [navigate]);

  return null;
}