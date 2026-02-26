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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Heart,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle,
  Shield,
  Users,
  Globe,
  Award,
  BookOpen,
  HandHeart,
  IndianRupee,
  Receipt,
  Gift,
  Star,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";

export default function Donation() {
  const [donationType, setDonationType] = useState("one-time");
  const [selectedAmount, setSelectedAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [donorInfo, setDonorInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    panNumber: "",
    purpose: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const predefinedAmounts = ["500", "1000", "2500", "5000", "10000", "25000"];

  const impactAreas = [
    {
      title: "Elder Care Support",
      description: "Supporting senior citizens with daily needs and healthcare",
      icon: Heart,
      funding: "₹2,50,000 raised",
      goal: "₹5,00,000",
      percentage: 50,
    },
    {
      title: "Time Sharing Platform",
      description: "Technology development and platform maintenance",
      icon: Globe,
      funding: "₹1,80,000 raised",
      goal: "₹3,00,000",
      percentage: 60,
    },
    {
      title: "Community Events",
      description: "Organizing activities and events for elder engagement",
      icon: Users,
      funding: "₹90,000 raised",
      goal: "₹2,00,000",
      percentage: 45,
    },
    {
      title: "Training & Education",
      description: "Digital literacy and skill development programs",
      icon: BookOpen,
      funding: "₹1,20,000 raised",
      goal: "₹2,50,000",
      percentage: 48,
    },
  ];

  const handleAmountSelection = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount("");
  };

  const handleDonation = () => {
    const amount = selectedAmount || customAmount;
    if (!amount || !donorInfo.name || !donorInfo.email || !paymentMethod) {
      alert("Please fill all required fields");
      return;
    }
    if (!agreeToTerms) {
      alert("Please agree to terms and conditions");
      return;
    }
    alert(
      `Thank you for your donation of ₹${amount}! You will be redirected to payment gateway.`,
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setDonorInfo((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Component */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mt-32 mb-8 sm:mb-16">
          {/* <Badge
            variant="secondary"
            className="mb-4 sm:mb-6 px-4 sm:px-6 py-2 text-sm font-medium hover:bg-share2care-red hover:text-white border-share2care-red text-share2care-red"
          >
             Make a Difference
          </Badge> */}
          <h1 className="text-2xl sm:text-2xl lg:text-2xl font-semibold mb-4 sm:mb-6 leading-tight">
            Support Our Mission
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
            Help us create a better world for senior citizens through innovative
            time-sharing programs, community support, and meaningful
            connections.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 max-w-4xl mx-auto">
            <h3 className="text-lg sm:text-xl font-semibold share2care-primary-text mb-2">
              Tax Benefits Available
            </h3>
            <p className="text-sm sm:text-base text-gray-700">
              Donations to Share2care Foundation are eligible for tax deduction
              under Section 80G. You will receive an official receipt for tax
              purposes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <Card className="share2care-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-share2care-red rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl share2care-primary-text">
                    Make a Donation
                  </CardTitle>
                </div>
                <CardDescription className="text-sm sm:text-base">
                  Your contribution will directly help improve the lives of
                  senior citizens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Donation Type */}
                <div className="space-y-3">
                  <Label className="text-sm sm:text-base font-medium">
                    Donation Type
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={
                        donationType === "one-time" ? "default" : "outline"
                      }
                      className={
                        donationType === "one-time"
                          ? "btn-share2care"
                          : "btn-share2care-outline"
                      }
                      onClick={() => setDonationType("one-time")}
                    >
                      One-time
                    </Button>
                    <Button
                      variant={
                        donationType === "monthly" ? "default" : ""
                      }
                      className={
                        donationType === "monthly"
                          ? " "
                          : ""
                      }
                      onClick={() => setDonationType("monthly")}
                    >
                      Monthly
                    </Button>
                  </div>
                </div>

                {/* Amount Selection */}
                <div className="space-y-3">
                  <Label className="text-sm sm:text-base font-medium">
                    Select Amount
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {predefinedAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={
                          selectedAmount === amount ? "default" : "outline"
                        }
                        className={`h-12 text-sm sm:text-base ${selectedAmount === amount ? "btn-share2care" : "btn-share2care-outline"}`}
                        onClick={() => handleAmountSelection(amount)}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-amount" className="text-sm">
                      Custom Amount
                    </Label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        id="custom-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) =>
                          handleCustomAmountChange(e.target.value)
                        }
                        className="pl-9 h-12 text-base border-gray-300 focus:border-share2care-red"
                      />
                    </div>
                  </div>
                </div>

                {/* Donor Information */}
                <div className="space-y-4">
                  <Label className="text-sm sm:text-base font-medium">
                    Donor Information
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="donor-name" className="text-sm">
                        Full Name *
                      </Label>
                      <Input
                        id="donor-name"
                        placeholder="Enter your full name"
                        value={donorInfo.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="h-12 text-base border-gray-300 focus:border-share2care-red"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donor-email" className="text-sm">
                        Email Address *
                      </Label>
                      <Input
                        id="donor-email"
                        type="email"
                        placeholder="Enter your email"
                        value={donorInfo.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="h-12 text-base border-gray-300 focus:border-share2care-red"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="donor-phone" className="text-sm">
                        Phone Number
                      </Label>
                      <Input
                        id="donor-phone"
                        placeholder="Enter your phone number"
                        value={donorInfo.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="h-12 text-base border-gray-300 focus:border-share2care-red"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donor-pan" className="text-sm">
                        PAN Number (for tax receipt)
                      </Label>
                      <Input
                        id="donor-pan"
                        placeholder="Enter PAN number"
                        value={donorInfo.panNumber}
                        onChange={(e) =>
                          handleInputChange("panNumber", e.target.value)
                        }
                        className="h-12 text-base border-gray-300 focus:border-share2care-red"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="donor-address" className="text-sm">
                      Address
                    </Label>
                    <Textarea
                      id="donor-address"
                      placeholder="Enter your address"
                      value={donorInfo.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      rows={3}
                      className="text-base border-gray-300 focus:border-share2care-red"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="donation-purpose" className="text-sm">
                      Purpose (Optional)
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("purpose", value)
                      }
                    >
                      <SelectTrigger className="h-12 text-base border-gray-300 focus:border-share2care-red">
                        <SelectValue placeholder="Select donation purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Support</SelectItem>
                        <SelectItem value="elder-care">
                          Elder Care Support
                        </SelectItem>
                        <SelectItem value="platform">
                          Platform Development
                        </SelectItem>
                        <SelectItem value="events">Community Events</SelectItem>
                        <SelectItem value="training">
                          Training & Education
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label className="text-sm sm:text-base font-medium">
                    Payment Method
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      variant={paymentMethod === "upi" ? "default" : "outline"}
                      className={`h-12 ${paymentMethod === "upi" ? "btn-share2care" : "btn-share2care-outline"}`}
                      onClick={() => setPaymentMethod("upi")}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      UPI
                    </Button>
                    <Button
                      variant={paymentMethod === "card" ? "default" : "outline"}
                      className={`h-12 ${paymentMethod === "card" ? "btn-share2care" : "btn-share2care-outline"}`}
                      onClick={() => setPaymentMethod("card")}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Card
                    </Button>
                    <Button
                      variant={paymentMethod === "bank" ? "default" : "outline"}
                      className={`h-12 ${paymentMethod === "bank" ? "btn-share2care" : "btn-share2care-outline"}`}
                      onClick={() => setPaymentMethod("bank")}
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Bank
                    </Button>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={setAgreeToTerms}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the{" "}
                    <Link
                      to="/terms-conditions"
                      className="text-share2care-red hover:underline"
                    >
                      Terms and Conditions
                    </Link>{" "}
                    and consent to receive updates about my donation and the
                    foundation's work.
                  </Label>
                </div>

                {/* Donate Button */}
                <Button
                  onClick={handleDonation}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold btn-share2care"
                  disabled={!agreeToTerms}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Donate ₹{selectedAmount || customAmount || "0"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Impact Areas & Statistics */}
          <div className="space-y-6">
            {/* Quick Donation */}
            <Card className="highlighted-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <HandHeart className="w-12 h-12 text-share2care-red mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Quick Donation
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Make an instant impact with a quick donation
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="btn-share2care h-10"
                      onClick={() => {
                        setSelectedAmount("1000");
                        setCustomAmount("");
                      }}
                    >
                      ₹1,000
                    </Button>
                    <Button
                      className="btn-share2care h-10"
                      onClick={() => {
                        setSelectedAmount("5000");
                        setCustomAmount("");
                      }}
                    >
                      ₹5,000
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Impact Statistics */}
            <Card className="share2care-card">
              <CardHeader>
                <CardTitle className="text-lg share2care-primary-text">
                  Our Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold share2care-primary-text">
                    ₹12,50,000
                  </div>
                  <p className="text-sm text-gray-600">
                    Total Donations Received
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900">
                      2,500+
                    </div>
                    <p className="text-xs text-gray-600">Elders Helped</p>
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900">
                      150+
                    </div>
                    <p className="text-xs text-gray-600">Donors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact for Large Donations */}
            <Card className="share2care-card">
              <CardHeader>
                <CardTitle className="text-lg share2care-primary-text">
                  Large Donations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700">
                  For donations above ₹1,00,000 or corporate partnerships,
                  please contact us directly.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-share2care-red" />
                    <span>+91-11-12345678</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-share2care-red" />
                    <span>donate@share2care.co</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Impact Areas */}
        <div className="mt-12 sm:mt-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Where Your{" "}
              <span className="share2care-primary-text">Donation Goes</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              See how your contribution creates real impact in our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {impactAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <Card key={index} className="share2care-card">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-share2care-red rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="text-lg">{area.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm sm:text-base">
                      {area.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{area.funding}</span>
                        <span className="text-gray-600">of {area.goal}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-share2care-red h-2 rounded-full transition-all duration-300"
                          style={{ width: `${area.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">
                        {area.percentage}% funded
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Donor Stories */}
        <section className="mt-12 sm:mt-16 mb-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Stories from Our{" "}
              <span className="share2care-primary-text">Donors</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Read how our donors are making a difference in the lives of senior
              citizens
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: "Mr. Anil Sharma",
                location: "Mumbai",
                amount: "₹25,000",
                story:
                  "Supporting elders gives me immense satisfaction. My monthly donation helps fund yoga sessions in my locality.",
                avatar: "👨‍💼",
              },
              {
                name: "Mrs. Kavita Joshi",
                location: "Delhi",
                amount: "₹5,000",
                story:
                  "After seeing how Share2care helped my mother find friends, I decided to contribute to this beautiful cause.",
                avatar: "👩‍🏫",
              },
              {
                name: "Ravi & Family",
                location: "Bangalore",
                amount: "₹15,000",
                story:
                  "Our family believes in supporting senior citizens. This platform creates real connections and we're proud to contribute.",
                avatar: "👨‍👩‍👧‍👦",
              },
            ].map((donor, index) => (
              <Card
                key={index}
                className="share2care-card hover:shadow-xl transition-shadow duration-300"
              >
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-share2care-red to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">{donor.avatar}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {donor.name}
                    </h3>
                    <p className="text-sm text-gray-600">{donor.location}</p>
                    <Badge className="bg-green-100 text-green-800 mt-2">
                      {donor.amount} donated
                    </Badge>
                  </div>
                  <p className="text-gray-700 text-sm italic leading-relaxed">
                    "{donor.story}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Security & Trust */}
        <div className="mt-12 sm:mt-16">
          <Card className="share2care-card">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <Shield className="w-12 h-12 text-share2care-red mx-auto mb-6" />
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                  Secure & Transparent
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm sm:text-base">
                  <div className="space-y-3">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                    <h4 className="font-medium text-lg">Secure Payments</h4>
                    <p className="text-gray-600 leading-relaxed">
                      All transactions are encrypted with bank-grade security.
                      Your financial information is completely protected.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Receipt className="w-8 h-8 text-green-500 mx-auto" />
                    <h4 className="font-medium text-lg">Tax Receipts</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Instant 80G tax deduction certificates sent to your email.
                      Save up to 50% on your tax liability.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <TrendingUp className="w-8 h-8 text-green-500 mx-auto" />
                    <h4 className="font-medium text-lg">Impact Reports</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Monthly reports showing exactly how your donation creates
                      impact in the elder community.
                    </p>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <div className="bg-green-50 px-4 py-2 rounded-full border border-green-200">
                    <span className="text-sm font-medium text-green-800">
                      🔒 SSL Secured
                    </span>
                  </div>
                  <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                    <span className="text-sm font-medium text-blue-800">
                      🏆 80G Certified
                    </span>
                  </div>
                  <div className="bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
                    <span className="text-sm font-medium text-purple-800">
                      📊 Transparent
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Share2care Footer */}
     <Footer/>
    </div>
  );
}
