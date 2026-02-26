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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  Users,
  Building,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "../components/Layout/Footer";
import { LuPhone } from "react-icons/lu";
import apiService from "@/services/api";
import { toast } from "sonner";
import Address from "@/components/Address";
import SupportTeam from "@/components/SupportTeam";
import FAQs from "@/components/FAQs";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await apiService.submitContactForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });
      
      toast.success("Thank you for your message! We will get back to you soon.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Contact form submission error:", error);
      toast.error(error.message || "Failed to submit contact form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const offices = [
    {
      title: "Head Office",
      address: "H-69, Sector 63, Noida, Uttar Pradesh 201307",
      phone: "+91-11-12345678",
      email: "info.share2care@gmail.com",
      hours: "Mon-Sat: 9:00 AM - 6:00 PM",
    },
    {
      title: "Delhi Branch",
      address: "Connaught Place, New Delhi, Delhi 110001",
      phone: "+91-11-87654321",
      email: "delhi@share2care.co",
      hours: "Mon-Fri: 10:00 AM - 5:00 PM",
    },
    {
      title: "Mumbai Office",
      address: "Bandra West, Mumbai, Maharashtra 400050",
      phone: "+91-22-12345678",
      email: "mumbai@share2care.co",
      hours: "Mon-Sat: 9:30 AM - 6:30 PM",
    },
  ];

  const faqs = [
    {
      question: "How can I join the Share2care platform?",
      answer:
        "You can join by clicking the 'User Login' button and following the registration process. You must be 60+ years old to participate.",
    },
    {
      question: "Is there any fee for using the platform?",
      answer:
        "No, our platform is completely free for elders. We believe in providing accessible community support services.",
    },
    {
      question: "How do I create a time-sharing event?",
      answer:
        "After registering and getting approved, you can create events by going to the Events section and clicking 'Create Event'.",
    },
    {
      question: "What safety measures are in place?",
      answer:
        "We verify all users through KYC documents and have community guidelines. However, users are responsible for their own safety during meetings.",
    },
    {
      question: "Can I cancel an event I created?",
      answer:
        "Yes, you can cancel events you created. Please notify participants in advance and provide a valid reason.",
    },
  ];

  return (
    <div className="h-screen bg-white overflow-x-hidden">
      {/* Header Component */}
      <Header />

       
        <div className="w-full mt-32 py-2 px-8 flex flex-col bg-[#70363a] text-white justify-center items-center mb-5">
          
        <h2 className="text-3xl sm:text-3xl lg:text-3xl font-bold leading-tight mb-2">
          Contact Us
        </h2>
        <hr className="h-0.5 bg-white text-white w-full max-w-40"/>
        </div>
        <div id="googlemap" className="mb-5 w-screen max-md:w-full border rounded-3xl">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.7509425455187!2d80.33146631435471!3d26.431512687003693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399c465667d45b69%3A0xa5a138a9f73dfe7f!2sDeveloper%20Brothers!5e0!3m2!1sen!2sin!4v1662112346443!5m2!1sen!2sin" className="w-full h-[300px] max-md:h-[220px] border rounded-3xl"></iframe>
        </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Header */}

        {/* <div className="hidden text-center mb-5">
          <Badge
            variant="secondary"
              className="mb-6 px-6 py-3 text-lg font-medium border-2 rounded-full  border-share2care-red text-share2care-red hover:bg-share2care-red hover:text-white transition-all duration-300"
              >
            <LuPhone className="text-xl mr-1"/> Contact Information
          </Badge>
          <h1 className="text-2xl sm:text-2xl lg:text-2xl font-semibold mb-3 leading-tight">
            Get In{" "}
            <span className="share2care-primary-text">Touch With Us</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-3 leading-relaxed">
            We're here to help and answer any questions you might have. We look
            forward to hearing from you and supporting your journey with
            Share2care Foundation.
          </p>
        </div> */}

        <div className="flex flex-col w-full gap-5 mb-3" id="contact-form">
          {/* Contact Form */}
          <div className="flex max-md:flex-col">
       
          <Card className="w-2/3 max-md:w-full border-0">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-share2care-red rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-2xl share2care-primary-text">
                  Send Us a Message
                </CardTitle>
              </div>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as
                possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter your full name"
                      required
                      className="border-gray-300 focus:border-share2care-red"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Enter your phone number"
                      className="border-gray-300 focus:border-share2care-red"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="border-gray-300 focus:border-share2care-red"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      handleInputChange("subject", e.target.value)
                    }
                    placeholder="Enter the subject of your message"
                    required
                    className="border-gray-300 focus:border-share2care-red"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    placeholder="Enter your message here..."
                    rows={5}
                    required
                    className="border-gray-300 focus:border-share2care-red"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="btn-share2care w-full mt-5" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          {/* Contact Information */}
          <div className="space-y-4 mx-auto w-1/3 max-md:w-full">
            <Card className="border-0">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-share2care-red rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-2xl share2care-primary-text">
                    Quick Contact
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 mt-5  grid max-sm:grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-5">
                <div className="flex max-sm:flex-col items-start space-x-4 shadow-lg rounded-2xl p-5">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-share2care-red" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">info.share2care @gmail.com</p>
                    <p className="text-sm text-gray-500">
                      We reply within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex max-sm:flex-col items-start space-x-4 shadow-lg rounded-2xl p-5">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-share2care-red" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600">+91-11-12345678</p>
                    <p className="text-sm text-gray-500">
                      Mon-Sat: 9:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex max-sm:flex-col items-start space-x-4 shadow-lg rounded-2xl p-5">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-share2care-red" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Address</h4>
                    <p className="text-gray-600">
                      H-69, Sector 63, Noida
                      <br />
                      Uttar Pradesh 201307
                    </p>
                  </div>
                </div>

                <div className="flex max-sm:flex-col items-start space-x-4 shadow-lg rounded-2xl p-5">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-share2care-red" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Working Hours
                    </h4>
                    <p className="text-gray-600">Monday - Saturday</p>
                    <p className="text-sm text-gray-500">9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* <Card className="highlighted-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="w-12 h-12 text-share2care-red mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Need Immediate Help?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    For urgent matters or immediate assistance, please call our
                    helpline
                  </p>
                  <Button className="btn-share2care">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now: +91-11-12345678
                  </Button>
                </div>
              </CardContent>
            </Card> */}
          </div>
         </div>

        </div>

        {/* Office Locations */}
        {/* <Address offices={offices} /> */}

        {/* Support Team */}
       {/* <SupportTeam /> */}

        {/* FAQ Section */}
        {/* <FAQs faqs={faqs}/> */}
       
      </div>

      {/* Share2care Footer */}
   <Footer/>
    </div>
  );
}
