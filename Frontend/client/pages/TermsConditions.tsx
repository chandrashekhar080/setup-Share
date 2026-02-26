import { useState, useEffect } from "react";
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
  ArrowLeft,
  Shield,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  Scale,
  Lock,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import apiService from "@/services/api";
import { toast, Toaster } from "sonner";
import Header, { HeaderPart } from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";

export default function TermsConditions() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("December 27, 2024");
  const [version, setVersion] = useState("1.0");

  // Fallback terms data in case API fails
  const fallbackTermsData = {
    lastUpdated: "December 27, 2024",
    version: "1.0",
    terms: [
      {
        id: 1,
        title: "Platform Usage Guidelines",
        content:
          "Elders sometimes find it difficult to connect with suitable person of similar age group and skills/interests of mutual liking, in nearby locality.",
      },
      {
        id: 2,
        title: "Purpose of Share2care Foundation",
        content:
          "In order to find such company, Share2care Foundation has developed this application for elders of the society to get connected with elders having similar skills to live active social life.",
      },
      {
        id: 3,
        title: "User Agreement",
        content:
          "By registering on this platform, you agree to follow the rules of the application:",
        subPoints: [
          "You will use this platform with very high moral, integrity, and respect to guest members.",
          "You will not in any way harm other member of this platform.",
          "There will be no financial involvement for joining such meeting.",
          "Share2care Foundation shall be in no way responsible for any misconduct of either party and/or financial transaction, if any.",
          "Share2care Foundation is not responsible for any activity amongst users of this platform.",
        ],
      },
      {
        id: 4,
        title: "Contact Exchange and Privacy",
        content:
          "On exchange of the contact number between Host and Guest(s), Share2care Foundation is not aware of any further development amongst them. Hence total responsibility is of Guest and the host.",
      },
      {
        id: 5,
        title: "Platform Safety",
        content:
          "Share2care Foundation provides a platform for elders to connect but takes no responsibility for offline interactions between users. Users must exercise their own judgment and caution.",
      },
      {
        id: 6,
        title: "Age Verification",
        content:
          "This platform is exclusively for elders aged 60 years and above. Age verification is required during registration through valid government ID documents.",
      },
      {
        id: 7,
        title: "No Commercial Use",
        content:
          "This platform is strictly for social connection and time-sharing activities. Any commercial use, advertising, or business promotion is strictly prohibited.",
      },
      {
        id: 8,
        title: "Data Privacy",
        content:
          "Your personal information is protected according to Indian privacy laws. We do not share your data with third parties without consent, except for safety and security purposes.",
      },
      {
        id: 9,
        title: "Account Termination",
        content:
          "Share2care Foundation reserves the right to suspend or terminate accounts that violate these terms or engage in inappropriate behavior as determined by our admin team.",
      },
      {
        id: 10,
        title: "Limitation of Liability",
        content:
          "Share2care Foundation operates as a facilitating platform only. We are not liable for any disputes, damages, or issues arising from user interactions or meetings.",
      },
    ],
  };

  // Load terms from API
  const loadTermsFromAPI = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get pages from API
      const pagesData = await apiService.getPublicPages();

      if (pagesData && pagesData.length > 0) {
        // Pages are already filtered as active from the API, just sort by ID
        const sortedPages = pagesData.sort((a, b) => a.id - b.id);

        setPages(sortedPages);

        // Set last updated date from the most recently updated page
        if (sortedPages.length > 0) {
          const mostRecentUpdate = sortedPages.reduce((latest, page) => {
            const pageDate = new Date(page.updated_at);
            const latestDate = new Date(latest);
            return pageDate > latestDate ? page.updated_at : latest;
          }, sortedPages[0].updated_at);

          setLastUpdated(
            new Date(mostRecentUpdate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          );
        }
      } else {
        // No pages found, use fallback data
        console.log("No pages found from API, using fallback data");
        setPages(fallbackTermsData.terms);
      }
    } catch (error) {
      console.error("Failed to load terms from API:", error);
      setError("Failed to load terms and conditions. Using default content.");

      // Use fallback data on error
      setPages(fallbackTermsData.terms);
      toast.error("Failed to load latest terms. Showing default content.");
    } finally {
      setLoading(false);
    }
  };

  // Load terms on component mount
  useEffect(() => {
    loadTermsFromAPI();
  }, []);

  return (
    <div className="h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <Header />

      <div className="w-full mt-32 py-2 px-8 flex flex-col bg-[#70363a] text-white justify-center items-center mb-2">
        <h2 className="text--2xl sm:text-2xl lg:text-2xl font-semibold leading-tight mb-2">Terms & Conditions</h2>
        <hr className="h-0.5 bg-white text-white w-full max-w-96" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text--2xl sm:text-2xl lg:text-2xl font-semibold mb-3 leading-tight">
            Legal<span className="pl-2 bg-clip-text text-share2care-red">
                Documents
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-3 leading-relaxed">
            Please read these terms and conditions carefully before using the
            Share2care Foundation time-sharing platform for elders.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Version {version}</span>
            </div>
            <div className="flex items-center space-x-2">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Last updated: {lastUpdated}</span>
            </div>
            {!loading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={loadTermsFromAPI}
                className="text-red-800 hover:text-share2care-dark-red"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            )}
          </div>
          {error && (
            <div className="mt-4 text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-lg inline-block">
              {error}
            </div>
          )}
        </div>

        {/* Important Notice */}
        <Card className="border-orange-200 bg-orange-50 mb-3">
          <CardContent className="pt-3">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">
                  Important Notice
                </h3>
                <p className="text-orange-900 text-sm leading-relaxed">
                  By using the Share2care Foundation platform, you acknowledge
                  that you have read, understood, and agree to be bound by these
                  terms and conditions. If you do not agree with any part of
                  these terms, please do not use our services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Content */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border-blue-100">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse flex-1"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page, index) => (
              <Card key={page.id || index} className="border-gray-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    {page.title || page.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 leading-relaxed">
                    {/* Render content as HTML if it contains HTML tags, otherwise as plain text */}
                    {page.content && page.content.includes("<") ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: page.content }}
                        className="prose prose-sm max-w-none"
                      />
                    ) : (
                      <div>
                        <p className="mb-4">{page.content}</p>
                        {/* Handle subPoints if they exist in the fallback data */}
                        {page.subPoints && (
                          <ul className="space-y-2">
                            {page.subPoints.map((point, pointIndex) => (
                              <li
                                key={pointIndex}
                                className="flex items-start space-x-2"
                              >
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 text-sm leading-relaxed">
                                  {point}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Show message if no pages found */}
            {!loading && pages.length === 0 && (
              <Card className="border-gray-200">
                <CardContent className="pt-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Terms & Conditions Available
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Terms and conditions are currently being updated. Please
                    check back later.
                  </p>
                  <Button onClick={loadTermsFromAPI} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Legal Information */}
        <div className="mt-12 space-y-3">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Scale className="w-5 h-5 mr-2 text-green-600" />
                Legal Framework
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-green-800">
                <p>
                  <strong>Organization:</strong> Share2care Social Services
                  Foundation
                </p>
                <p>
                  <strong>Registration:</strong> Non-profit organization under
                  Section 8 of the Companies Act, 2013
                </p>
                <p>
                  <strong>Jurisdiction:</strong> These terms are governed by
                  Indian law and subject to Delhi jurisdiction
                </p>
                <p>
                  <strong>Compliance:</strong> All activities comply with
                  applicable Indian laws and regulations
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Lock className="w-5 h-5 mr-2 text-purple-600" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-purple-800">
                <p>
                  Your privacy is important to us. We collect only necessary
                  information for platform functionality and user safety.
                </p>
                <p>
                  KYC documents are required for identity verification and
                  platform security. All data is stored securely and not shared
                  with unauthorized parties.
                </p>
                <p>
                  Users have the right to request data deletion by contacting
                  our support team.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="mt-5 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">
              Questions About These Terms?
            </CardTitle>
            <CardDescription>
              Contact us if you have any questions or concerns about these terms
              and conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email Support</p>
                  <p className="text-sm text-gray-600">legal@share2care.co</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Phone Support</p>
                  <p className="text-sm text-gray-600">+91-11-12345678</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agreement Section */}
        <Card className="mt-8 border-gray-300 bg-gray-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Agreement Acknowledgment
              </h3>
              <p className="text-gray-600 mb-3 max-w-2xl mx-auto">
                By continuing to use Share2care Foundation's services, you
                acknowledge that you have read, understood, and agree to abide
                by these terms and conditions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/user">
                  <Button className="bg-primary hover:bg-share2care-dark-red">
                    I Accept - Join Platform
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline">Return to Homepage</Button> 
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
      <Footer/>
    </div>
  );
}
