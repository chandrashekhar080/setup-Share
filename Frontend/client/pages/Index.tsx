import { useState, useEffect, useRef } from "react";
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
  Users,
  Calendar,
  Shield,
  Heart,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  TrendingUp,
  Award,
  Globe,
  Sparkles,
  Target,
  HandHeart,
  Gift,
  Zap,
  ChevronRight,
  HandshakeIcon,
  StarsIcon,
  RocketIcon,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "../components/Layout/Footer";
import { MdEvent } from "react-icons/md";
import CTASection from "@/components/CTASection";
import apiService from "@/services/api";

const testimonials = [
  {
    name: "Mrs. Sunita Sharma",
    age: "68",
    location: "Delhi",
    text: "I was lonely after my husband passed away. Share2care gave me a new family. I now teach yoga to 20 wonderful people and feel young again!",
    rating: 5,
    activity: "Yoga Teacher",
  },
  {
    name: "Mr. Rajesh Kumar",
    age: "65",
    location: "Mumbai",
    text: "Being a retired teacher, I thought my teaching days were over. Through Share2care, I started chess clubs and taught 50+ seniors. It's incredibly fulfilling!",
    rating: 5,
    activity: "Chess Mentor",
  },
  {
    name: "Mrs. Priya Gupta",
    age: "62",
    location: "Bangalore",
    text: "I love cooking but had no one to share with. Now I host cooking sessions every week. I've made 15 close friends and learned 20 new recipes!",
    rating: 5,
    activity: "Cooking Host",
  },
  {
    name: "Mrs. Sunita Sharma",
    age: "68",
    location: "Delhi",
    text: "I was lonely after my husband passed away. Share2care gave me a new family. I now teach yoga to 20 wonderful people and feel young again!",
    rating: 5,
    activity: "Yoga Teacher",
  },
  {
    name: "Mr. Rajesh Kumar",
    age: "65",
    location: "Mumbai",
    text: "Being a retired teacher, I thought my teaching days were over. Through Share2care, I started chess clubs and taught 50+ seniors. It's incredibly fulfilling!",
    rating: 5,
    activity: "Chess Mentor",
  },
  {
    name: "Mrs. Priya Gupta",
    age: "62",
    location: "Bangalore",
    text: "I love cooking but had no one to share with. Now I host cooking sessions every week. I've made 15 close friends and learned 20 new recipes!",
    rating: 5,
    activity: "Cooking Host",
  },
];
export default function Index() {
  const navigate = useNavigate();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  //Load Users  Count From APi
  const [userCount, setUserCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [cityCount, setCityCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [ratings, setRatings] = useState<number[]>([]);
  const [count, setCount] = useState(0);
  const [average, setAverage] = useState(0);
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  const nextSlide = () =>
    setCurrent((prev) => (prev + 1) % testimonials.length);

  const prevSlide = () =>
    setCurrent(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );

  useEffect(() => {
    timeoutRef.current = setTimeout(nextSlide, 3500); // auto slide every 3.5s
    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  function formatCount(num: number): string {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "b";
    if (num >= 10_000_00) return (num / 1_00_000).toFixed(1) + "l"; // lakh
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "m";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
    return num.toString();
  }

  //For User Count
  useEffect(() => {
    async function fetchUserCount() {
      // setLoading(true);
      try {
        const allUsersResponse = await apiService.getAllUsers();
        setUserCount(allUsersResponse.length);
        const rawCount = allUsersResponse.length;
        console.log(rawCount);

        setUserCount(formatCount(rawCount));
      } catch (error) {
        console.error("Failed to load users count:", error);
        // setError("Failed to load users count. Please try again later.");
      } // or your API call
    }

    fetchUserCount();
  }, []);
  //For Event Count
  useEffect(() => {
    // Load events data from API
    async function fetchEventsData() {
      try {
        // Get all approved events
        const allEvents = await apiService.getAllEvents();

        // Filter events by status and date
        // const approved = allEvents.filter(
        //   (event) => event.status === "active" || event.status === "approved",
        // );
        // const allCities = allEvents.map((event) => event.location?.trim());
        // const uniqueCities = [...new Set(Cities)];
        const uniqueLocations = [
          ...new Set(
            allEvents.map((event) => event.location?.trim()).filter(Boolean),
          ),
        ].sort();
        setCityCount(uniqueLocations.length - 1);
        // const rawCountCities = allCities.length;
        // setCityCount(formatCount(rawCountCities));
        const rawCount = allEvents.length;
        setEventCount(formatCount(rawCount));
      } catch (error) {
        console.error("Failed to load events:", error);
      }
    }

    fetchEventsData();
  }, []);
  //For City Count
  useEffect(() => {
    // Load cities data from API
    async function fetchCategoriesData() {
      try {
        const allCategory = await apiService.getAllCategories();
        const rawCount = allCategory.length;
        setCategoryCount(formatCount(rawCount));
      } catch (error) {
        console.error("Failed to load cities:", error);
      }
    }
    fetchCategoriesData();
  }, []);
  //For Ratings Count
  useEffect(() => {
    async function fetchRatings() {
      try {
        const allRatings = await apiService.getAllReviews(); // Assume returns number[]
        const ratingCount = allRatings.reviews.map((review) => review.rating);
        console.log("Ratings:", ratingCount);
        setRatings(ratingCount);
      } catch (err) {
        console.error(err);
      }
    }
    fetchRatings();
  }, []);
  //For Average Rating
  useEffect(() => {
    if (ratings.length > 0) {
      setCount(ratings.length);
      const total = ratings.reduce((acc, val) => acc + val, 0);
      setAverage(total / ratings.length);
      console.log(average);
    } else {
      setCount(0);
      setAverage(0);
    }
  }, [ratings]);

  // Check if user is logged in
  useEffect(() => {
    const userPhone = localStorage.getItem("userPhone");
    const userLoggedIn = localStorage.getItem("userLoggedIn");
    const userToken = localStorage.getItem("userToken");
    setIsUserLoggedIn(!!(userPhone && userLoggedIn && userToken));
    // loadUserCount();
  }, []);

  const handleCreateEvent = () => {
    if (isUserLoggedIn) {
      navigate("/events?create=true");
    } else {
      navigate("/user");
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header Component */}
      <Header />
      {/* Hero Section with Advanced Design */}
      <section className="max-md:px-5 rounded-2xl max-w-7xl mx-auto relative z-10 mt-32 py-10  flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-share2care-red/20 to-transparent rounded-full -translate-x-48 -translate-y-48 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-yellow-400/20 to-transparent rounded-full translate-x-48 translate-y-48 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-transparent rounded-full animate-bounce delay-500"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center ">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-5">
              <div className="space-y-3 flex flex-col items-start justify-center max-sm:gap-1 gap-5">
                {/* <Badge
                  variant="secondary"
                  className="max-md:ml-2  max-md:text-sm mb-4 px-8 py-3 text-lg font-bold bg-gradient-to-r from-share2care-yellow to-yellow-300 text-share2care-red border-0 shadow-lg "
                >
                  <HandshakeIcon/><span className="ml-3"> Connecting 10,000+ Elders Across India</span>
                </Badge> */}

                <h1 className="text-2xl sm:text-2xl lg:text-2xl font-semibold leading-tight">
                  <span className="text-gray-900">Share Your</span>
                  <span className="text-gray-900"> Time</span>
                  <br />
                  {/* <span className="text-gray-900">Share Your </span>
                  <span className="text-gray-900"> Heart</span> */}
                </h1>
                <ul className="list-disc list-outside pl-5 max-sm:pl-1">
                  <li className="pl-0 text-lg max-md:text-sm max-md:ml-1 max-md:w-xl max-md:px-10 max-sm:px-0 max-sm:mt-2 text-gray-600 leading-relaxed max-w-2xl">
                    Join India’s Most Trusted Community Platform for Seniors
                    (60+).
                  </li>
                  <li className="text-lg pl-0 max-md:text-sm max-md:ml-1 max-md:w-xl max-md:px-10 max-sm:px-0 max-sm:mt-2 text-gray-600 leading-relaxed max-w-2xl">
                    Connect with like-minded peers, embrace every moment of your
                    golden years with joy and purpose.
                  </li>
                  <li className="text-lg pl-0 max-md:text-sm max-md:ml-1 max-md:w-xl max-md:px-10 max-sm:px-0 max-sm:mt-2 text-gray-600 leading-relaxed max-w-2xl">
                    Experience a time-sharing concept with nearby seniors having
                    similar interests.
                  </li>
                </ul>
              <div className="flex flex-col sm:flex-row gap-6">
                {!isUserLoggedIn ? (
                  <>
                    {/* <Link to="/user" className="group">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-share2care-red to-red-600 hover:from-red-600 hover:to-red-700 text-white px-12 py-6 text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
                      >
                        Join Free Today
                      </Button>
                    </Link> */}
                    <Link to="/time-sharing" className="group">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-3 text-gray-900 bg-white px-8 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                      >
                        How It Works
                      </Button>
                    </Link>
                  </>
                ) : (
                  ""
                  // <>
                  //   <Button
                  //     onClick={handleCreateEvent}
                  //     size="lg"
                  //     className="bg-gradient-to-r from-share2care-red to-red-600 hover:from-red-600 hover:to-red-700 text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
                  //   >
                  //     <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" />
                  //     Create Event
                  //     <Calendar className="w-6 h-6 ml-3 group-hover:animate-pulse" />
                  //   </Button>
                  //   <Link to="/events" className="group">
                  //     <Button
                  //       variant="outline"
                  //       size="lg"
                  //       className="border-3 border-share2care-red text-white bg-gradient-to-r from-share2care-red to-red-600 hover:from-red-600 hover:to-red-700 hover:text-white px-12 py-6 text-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  //     >
                  //       <Calendar className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                  //       Browse Events
                  //     </Button>
                  //   </Link>
                  //   <Link to="/time-sharing" className="group">
                  //     <Button
                  //       variant="outline"
                  //       size="lg"
                  //       className="border-2 border-gray-300 text-gray-700 hover:border-share2care-red hover:text-share2care-red px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  //     >
                  //       How It Works
                  //     </Button>
                  //   </Link>
                  // </>
                )}
              </div>
              </div>

            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <img
                  src="/Images/Agedperson.jpeg"
                  alt="Happy elderly family enjoying outdoor dinner party together, celebrating community and connection"
                  className="px-4 max-md:mx-10 max-md:w-[350px] max-md:rounded-xl w-full max-md:h-[350px] h-[360px] object-cover"
                />
                <video
                  src="https://www.shutterstock.com/shutterstock/videos/3810603635/preview/stock-footage-japanese-elderly-man-walking-for-exercise-back-view-rehabilitation.webm"
                  controlsList="nodownload"
                  controls
                  disablePictureInPicture
                  autoPlay
                  muted //  add this
                  loop
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer rounded-xl max-md:rounded-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

                {/* Floating Stats */}
                <div className="absolute max-sm:w-[250px] max-md:w-[300px] max-md:px-3 max-sm:right-0 max-sm:left-0 max-md:right-10 max-md:left-10 bottom-6 left-6 right-6 grid grid-cols-3 -mb-4 gap-4 max-md:gap-1">
                  <div className="bg-white/90 backdrop-blur-sm border-3 rounded-xl py-3 max-md:p-2 max-md:px-1 flex flex-row items-center justify-center text-center shadow-xl hover:shadow-2xl text-lg">
                    <Users className="w-5 h-6 text-blue-600" />
                    <span className="max-md:text-xs font-semibold text-gray-700">
                      {userCount}+ Members
                    </span>{" "}
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm border-3 rounded-xl py-3 max-md:py-2 max-md:px-1 flex flex-row items-center justify-center text-center shadow-xl hover:shadow-2xl text-lg">
                    <MdEvent className=" w-6 h-6 text-green-600" />
                    <span className="max-md:text-xs font-semibold text-gray-700 pl-2">
                      {eventCount}+ Events
                    </span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm border-3 rounded-xl py-3 max-md:py-2 max-md:px-1 flex flex-row items-center justify-center text-center shadow-xl hover:shadow-2xl text-lg">
                    <Star className="w-6 h-6 text-yellow-500" />
                    <span className="max-md:text-xs font-semibold text-gray-700 pl-2">
                      {average}/5 Rating
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              {/* <div className="max-md:mr-20 absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl ">
                <Sparkles className="w-10 h-10 text-white" />
              </div>

              <div className="max-md:ml-[60px] absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center shadow-xl ">
                <Heart className="w-10 h-10 text-white" />
              </div> */}
            </div>
          </div>
        </div>
      </section>
      {/* Features Section with Modern Design */}
      <section className="py-5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-md:mt-2 text-center mb-5">
            {/* <Badge className="mb-6 px-6 py-2 text-lg  hover-bg-red-600 hover:text-white border-0">
              <StarsIcon/>
              <span className="ml-2">Why 10,000+ Seniors Choose Us</span>
            </Badge> */}
            <h2 className="text-2xl sm:text-2xl lg:text-2xl font-semibold leading-tight">
              Built for
              Seniors, By
              Experts
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Every feature is designed keeping seniors’ requirement in mind.
              Community members are verified for safety and peace of mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Shield,
                title: "Safe & Verified",
                description:
                  "Every member is verified through KYC. Meet only trusted community members in safe environments.",
                color: "from-green-400 to-emerald-500",
                stats: "100% Verified",
              },
              {
                icon: MapPin,
                title: "Local Community",
                description:
                  "Connect with seniors in your neighborhood. No long travels - everything happens near you.",
                color: "from-blue-400 to-cyan-500",
                stats: `${cityCount} + Cities`,
              },
              {
                icon: Calendar,
                title: "Flexible Activities",
                description: `Choose activity of your liking. We have list of ${categoryCount}+ activities, where you can also give your choice to add. Various categories include - from yoga to carrom, chess to religious discourses. Your interests, your schedule.
`,
                color: "from-purple-400 to-pink-500",
                stats: `${eventCount} + Events`,
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transform hover:-translate-y-2 border-2 shadow-xl"
              >
                <CardContent className="p-3 text-center">
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg `}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    {feature.description}
                  </p>
                  <Badge className="bg-gray-100 text-gray-700 font-semibold">
                    {feature.stats}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="py-5 bg-gradient-to-br from-gray-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-2xl lg:text-2xl font-semibold leading-tight text-gray-900 mb-3">
              Getting Started is
              Simple
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join brigade of seniors who found company and purpose to utilise
              time effectively in just 3 easy steps.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Sign Up Free",
                description:
                  "Create your profile in 2 minutes. Add your interests and skills. Get verified instantly.",
                image:
                  "https://media.istockphoto.com/id/1137708431/photo/indian-asian-senior-couple-video-chatting-on-tablet-computer-while-sitting-at-couch-or-in.jpg?s=612x612&w=0&k=20&c=4iUxyrruREBhSL5aK2fm-Iat3A5_h0U1Y4zRoPF2w9Y=",
                color: "from-red-400 to-pink-500",
              },
              {
                step: "02",
                title: "Find Activities",
                description:
                  "Browse events near you. From playing indoor games to religious discourses - find what excites you.",
                image:
                  "https://media.istockphoto.com/id/1455018915/photo/old-men-friends-playing-with-ball-at-park.jpg?s=612x612&w=0&k=20&c=CA4Ndr7FwsLA4yPyasm6ACrA3ZLKy4P_OF64lCBRAiA=",
                color: "from-blue-400 to-purple-500",
              },
              {
                step: "03",
                title: "Connect & Share",
                description:
                  "Meet amazing people, share your knowledge, learn new skills, and enjoy jovial company.",
                image:
                  "https://media.istockphoto.com/id/1453267996/photo/portrait-of-a-group-of-happy-senior-men-and-women-standing-together-in-park-wearing-summer.jpg?s=612x612&w=0&k=20&c=oXiaU0kIBuUwngVy9G_Fys5joGLnd8GS7hRxZk5qOvc=",
                color: "from-green-400 to-teal-500",
              },
            ].map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-white rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4">
                  <div
                    className={`absolute -top-6 left-8 w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}
                  >
                    <span className="text-2xl font-bold text-white">
                      {step.step}
                    </span>
                  </div>

                  <div className="mt-8 mb-5">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-48 object-cover rounded-2xl"
                    />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connection Line */}
                {/* {index < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-1 bg-gradient-to-r from-share2care-red to-transparent"></div>
                )} */}
              </div>
            ))}
          </div>
          <div className="w-full mt-5 flex justify-center items-center">
            {isUserLoggedIn ? (
              <Link to="/user-dashboard" className="group">
                <Button
                variant="outline"
                  size="lg"
                  className="border-3 text-gray-900 bg-white px-8 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Join Free Today
                </Button>
              </Link>
            ) : (
              <Link to="/user" className="group">
                <Button
                variant="outline"
                  size="lg"
                  className="border-3 text-gray-900 bg-white px-8 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Join Free Today
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
      {/* Social Proof Section */}
      <section className=" max-md:pt-6 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text--2xl sm:text-2xl lg:text-2xl font-semibold leading-tight text-gray-900 mb-5">
              What Our Community
              Says
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Amazing experiences from members who transformed their lives
              through the “Time Sharing” concept of Share2Care Foundation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 overflow-hidden overflow-y-auto max-h-96 px-3 py-5">
            {testimonials.map((testimonial, current) => (
              <Card
                key={current}
                className="bg-gradient-to-br from-white to-gray-50 max-h-80 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2"
              >
                <CardContent className="p-5">
                  <div className="flex items-center mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-share2care-red to-red-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {testimonial.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        {testimonial.name}
                      </h4>
                      <p className="text-gray-600">
                        Age {testimonial.age} • {testimonial.location}
                      </p>
                      <Badge className="mt-1 bg-blue-100 text-blue-800">
                        {testimonial.activity}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 max-md:text-sm overflow-hidden italic leading-relaxed text-lg">
                    "{testimonial.text}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      {/* <CTA Section/> */}
      <Footer />
    </div>
  );
}
