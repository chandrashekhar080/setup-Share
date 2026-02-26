import { useState } from "react";
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
  Heart,
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "@/services/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.adminLogin(email, password);
      
      // Check for both possible response structures
      const token = response.access_token || response.token;
      const user = response.user;
      
      if (token && user) {
        // Verify user is an admin (type should be '0' or 'admin')
        if (user.type === '0' || user.type === 'admin' || user.role === 'admin') {
          // Set admin login state in localStorage
          localStorage.setItem("adminLoggedIn", "true");
          localStorage.setItem("adminUsername", `${user.first_name} ${user.last_name}`);
          localStorage.setItem("adminToken", token);
          localStorage.setItem("adminUser", JSON.stringify(user));
          navigate("/admin");
        } else {
          setError("Access denied. Admin privileges required.");
        }
      } else {
        setError("Invalid response from server.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="border-b shadow-lg bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Login
                </span>
                <p className="text-sm text-gray-600">Share2care Foundation</p>
              </div>
            </Link>
            <Link to="/">
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Login Card */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>
              Secure login for Share2care Foundation administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              {/* Security Notice */}
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800 mb-1">
                    Security Notice
                  </h4>
                  <p className="text-sm text-orange-700">
                    Admin access provides full control over user management,
                    events, and system settings. Only authorized personnel
                    should have access.
                  </p>
                </div>
              </div>
            </div>
            {/* Demo Credentials Info */}
            {/* <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Demo Credentials
              </h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>
                  <strong>Email:</strong> admin@sharetocare.com
                </p>
                <p>
                  <strong>Password:</strong> admin123
                </p>
              </div>
            </div> */}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-1">Login Failed</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In to Admin Panel
                  </div>
                )}
              </Button>
            </form>

          

            {/* Features Access */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">
                Admin Panel Features:
              </h4>
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>User approval and management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Event monitoring and moderation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Database and skill set management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>MIS reports and analytics</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Contact */}
        <Card className="mt-6 border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h4 className="font-medium text-gray-800 mb-2">
                Need Technical Support?
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Contact IT support for login issues or system problems
              </p>
              <div className="flex justify-center space-x-3">
                <Badge variant="outline">📧 support@share2care.co</Badge>
                <Badge variant="outline">📞 +91-11-12345678</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
