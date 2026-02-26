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
  Users,
  Calendar,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Shield,
  Globe,
  Target,
  Award,
  MessageSquare,
  HandHeart,
  Sparkles,
  HandshakeIcon,
  User,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "../components/Layout/Footer";
import SuccessStories from "@/components/SuccessStories";
import HowitsWork from "@/components/HowitsWork";
import { useEffect, useState } from "react";
import apiService from "@/services/api";
import groupYoga from "../../public/ImageS/GENS.jpg";
import Testomonials from "@/components/Testomonials";
import Benifits from "@/components/Benifits";
import saftyGuide from "../components/saftyGuide";
import problemwesolved from "../../public/Images/problemwesolve.jpg";
import peoplewithsameintrestconnect from "../../public/Images/groupconnect.jpg";

export default function TimeSharing() {
  function formatCount(num: number): string {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "b";
    if (num >= 10_000_00) return (num / 1_00_000).toFixed(1) + "l"; // lakh
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "m";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
    return num.toString();
  }

  const [categoryCount, setCategoryCount] = useState([]);

  useEffect(() => {
    // Load cities data from API
    async function fetchCategoriesData() {
      try {
        const allCategory = await apiService.getAllCategories();
        // const rawCount = allCategory.length;
        // setCategoryCount(formatCount(rawCount));
        setCategoryCount(allCategory);
      } catch (error) {
        console.error("Failed to load cities:", error);
      }
    }
    fetchCategoriesData();
  }, []);

  const categoryNames = categoryCount.map((category) => category.name);

  const benefits = [
    {
      icon: Heart,
      title: "Combat Loneliness",
      description:
        "Connect with like-minded people and build meaningful friendships",
    },
    {
      icon: Users,
      title: "Social Interaction",
      description:
        "Engage in activities and conversations with fellow community members",
    },
    {
      icon: Lightbulb,
      title: "Learn New Skills",
      description:
        "Discover new hobbies and learn from others' experiences and expertise",
    },
    {
      icon: HandHeart,
      title: "Share Knowledge",
      description: "Pass on your wisdom and skills to others in the community",
    },
    {
      icon: Shield,
      title: "Safe Environment",
      description:
        "Meet in a verified and trusted community with proper guidelines",
    },
    {
      icon: Globe,
      title: "Local Connections",
      description:
        "Find activities and friends in your neighborhood and locality",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Register & Verify",
      description:
        "Sign up with your mobile number, complete your profile, and verify your identity through KYC documents.",
      icon: CheckCircle,
    },
    {
      step: 2,
      title: "Explore Activities",
      description:
        "Browse events and activities based on your interests, skills, and location preferences.",
      icon: Calendar,
    },
    {
      step: 3,
      title: "Join or Create",
      description:
        "Join existing events or create your own activities to share your skills with others.",
      icon: Users,
    },
    {
      step: 4,
      title: "Connect & Share",
      description:
        "Meet fellow elders, share experiences, learn new things, and build lasting friendships.",
      icon: Heart,
    },
  ];

  const activityCategories = [
    "Artistic activities",
    "Community/Social service",
    "Cooking or baking",
    "Healthcare discussions",
    "Playing musical instruments",
    "Games/Sports",
    "Outdoor activities",
    "Cycling/Swimming",
    "Photography",
    "Blog Writing",
    "Religious Discussions",
    "Political discussions",
    "Exploring Culture",
    "Dancing",
    "Charity work",
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
    "Mindful Morning sessions",
  ];

  const testimonials = [
    {
      name: "Mrs. Sunita Sharma",
      age: 68,
      location: "Delhi",
      text: "I found wonderful friends through yoga sessions. It's amazing how technology can bring elders together!",
      rating: 5,
    },
    {
      name: "Mr. Rajesh Kumar",
      age: 65,
      location: "Mumbai",
      text: "Teaching chess to others gives me purpose. The platform is easy to use and very safe.",
      rating: 5,
    },
    {
      name: "Mrs. Priya Gupta",
      age: 62,
      location: "Bangalore",
      text: "I love the cooking sessions! Sharing recipes and learning new dishes keeps me active and happy.",
      rating: 5,
    },
  ];

  // function useIsActive(targetPathWithHash) {
  //   const location = useLocation();
  //   return location.pathname + location.hash === targetPathWithHash;
  // }

  const location = useLocation();
  const isActiveHash = (hash: string) => location.hash === hash;

  return (
    <div id="sectionelders" className="h-screen bg-white overflow-x-hidden">
      {/* Header Component */}
      <Header />

      <div  className="w-full mt-32 py-2 px-8 flex flex-col bg-[#70363a] text-white justify-center items-center mb-2">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Time Sharing</h2>
        <hr className="h-0.5 bg-white text-white w-full max-w-48" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Hero Section */}
        <div 
          className="text-left py-3 px-8 bg-gradient-to-br from-red-50 to-yellow-50 rounded-3xl mb-3"
        >
          {/* <Badge
             variant="secondary"
              className="mb-6 px-6 py-3 text-lg font-medium border-2 rounded-full  border-share2care-red text-share2care-red hover:bg-share2care-red hover:text-white transition-all duration-300"
             ><HandshakeIcon/><span className="ml-2"> Revolutionary Concept</span>
          </Badge> */}
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2 leading-tight">
            <span className="text-2xl share2care-primary-text">
              Elder's Social Connect
            </span>
          </h1>
          <div
            className="text-center text-lg sm:text-md text-gray-600 leading-relaxed pl-0
          "
          >
            (A revolutionary approach towards community building for senior
            citizens)
          </div>
          <ul className="list-disc list-outside pl-5">
            <li className="text-lg sm:text-md text-gray-600 leading-relaxed pl-0">
              Elders in the society either living with children or away from
              family members. Sometimes they find it difficult to utilise time
              effectively. During golden years, this results in isolation which
              is lack of company to pass quality time or for sharing
              experience/emotions.  
            </li>
            <li className="text-lg sm:text-md text-gray-600 leading-relaxed pl-0">
              This platform facilitates the concept of “Time Sharing”, wherein
              you can share time with others having a common interest area by
              arranging meetings at your place or join meetings arranged by
              others.
            </li>
            <li id="sectionwhatis"  className="text-lg sm:text-md text-gray-600 leading-relaxed pl-0">
              It is a revolutionary concept where elders connect with fellow
              community members to share skills, hobbies, experiences, and enjoy
              meaningful moments.
            </li>
          </ul>

          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/user">
              <Button className="btn-share2care px-8 py-3 text-lg">
                <Users className="w-5 h-5 mr-2" />
                Join Our Community
              </Button>
            </Link>
            <Link to="/events">
              <Button
          
                className="max-md:text-sm border border-share2care-red text-share2care-red hover:bg-share2care-red hover:text-white bg-white px-8 py-3 text-lg"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Browse Events
              </Button>
            </Link>
          </div> */}
        </div>

        {/* What is Time Sharing */}
        <section 
          className="py-3 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-yellow-50 rounded-3xl mb-3"
        >
          <div className="text-center mb-5">
            <h2 className="text-2xl pt-5 sm:text-2xl font-semibold text-gray-900 mb-3">
              What is
              Time Sharing?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Time sharing refers to dividing and allocating your time among
              friends, family, work colleagues, social groups, and personal
              time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-5">
            <div className="space-y-6">
              <p className="text-lg text-share2care-red font-medium leading-relaxed">
                Key Aspects
              </p>
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-share2care-red mt-1 flex-shrink-0" />
                  <p className="text-gray-700 text-lg">
                    <strong>Skill Sharing:</strong> Share your expertise in
                    creative, mental and game-related, social, and religious
                    activities, etc. The same you can learn from others too.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-share2care-red mt-1 flex-shrink-0" />
                  <p className="text-gray-700 text-lg">
                    <strong>Social Connection:</strong> Meet like-minded people
                    in your locality and build meaningful friendships.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-share2care-red mt-1 flex-shrink-0" />
                  <p className="text-gray-700 text-lg">
                    <strong>Active Lifestyle:</strong> Stay engaged, active, and
                    mentally stimulated through regular activities.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-share2care-red mt-1 flex-shrink-0" />
                  <p className="text-gray-700 text-lg">
                    <strong>Community Support:</strong> Be part of a caring
                    community that values experience and wisdom.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://media.istockphoto.com/id/1295068990/photo/senior-male-friends-having-fun-at-park.webp?a=1&b=1&s=612x612&w=0&k=20&c=mxW9j5Zxmi2jPBqUYLzhKoL9K-5I1cC4gtqit5iVH7k="
                  alt="Young woman helping elderly man with technology, showing intergenerational support"
                  className="w-full h-80 object-cover"
                />
              </div>
              {/* Floating indicators */}
              {/* <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold share2care-primary-text">
                    94%
                  </div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              </div> */}

              {/* <div className="absolute -top-4 -right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold share2care-primary-text">
                    10K+
                  </div>
                  <p className="text-sm text-gray-600">Members</p>
                </div>
              </div> */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white shadow-lg hover:shadow-xl rounded-3xl transition-shadow duration-300">
              <CardContent className="pt-3 flex flex-col gap-4">
                <h3 className="text-xl font-semibold share2care-primary-text mb-4">
                  The Problem We Solve
                </h3>
                <div className="relative w-full">
                  <div className="rounded-2xl border overflow-hidden w-full">
                    <img
                      src={problemwesolved}
                      alt="problemwesolved"
                      className="w-full h-80 object-cover"
                    />
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Our traditional social structures are changing, leading to
                  increased isolation among seniors. Elders sometimes find it
                  difficult to connect with suitable persons of similar age
                  group and similar skills/interests in nearby locality.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl rounded-3xl transition-shadow duration-300">
              <CardContent className="pt-3 flex flex-col gap-4">
                <h3 className="text-xl font-semibold share2care-primary-text mb-4">
                  Our Innovative Solution
                </h3>
                <div className="relative w-full">
                  <div className="rounded-2xl border overflow-hidden w-full">
                    <img
                      src={peoplewithsameintrestconnect}
                      alt="peoplewithsameintrestconnect"
                      className="w-full h-80 object-cover"
                    />
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Share2care Foundation has developed an innovative concept
                  where elders [aged 60+] of the society get connected with
                  elders, in nearby area having similar interests. This will
                  result in coming together to share their time to live active
                  social life by enjoying their hobbies, likings, skills, and
                  experiences through organized events. Technology meets
                  tradition to create meaningful connections.
                </p>
                <p id="sectionactivity"  className="text-gray-700 leading-relaxed mt-2">
                  In this digital era for our social and psychological
                  well-being, a conscious, practical, result-oriented and
                  persistent effort is being put to achieve elders’ happiness.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        {/* <HowitsWork howItWorks={howItWorks}/> */}

        {/* Benefits */}
        {/* <Benifits benefits={benefits}/> */}

        {/* Activity Categories */}
        <div className="mb-3">
          <div className="text-center mb-3  ">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Activity
            Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore the wide range of activities you can participate in or
              host
            </p>
          </div>

          <Card className="share2care-card">
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {categoryNames.map((name, index) => (
                  <div
                    key={index}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 text-center hover:bg-red-100 transition-colors"
                  >
                    <p className="text-sm font-medium text-share2care-red">
                      {name}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Stories */}
        {/* <SuccessStories/> */}

        {/* Testimonials */}
        {/* <Testomonials testimonials={testimonials}/> */}

        {/* Safety & Guidelines */}
        {/* <saftyGuide /> */}

        {/* Call to Action */}
        {/* <Card className="highlighted-card text-center">
          <CardContent className="pt-5 pb-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start{" "}
              <span className="share2care-primary-text">Time Sharing?</span>
            </h2>
            <p className="text-xl text-gray-600 mb-5 max-w-2xl mx-auto">
              Join thousands of elders who have found friendship, purpose, and
              joy through our time-sharing platform. Your journey to an active
              and connected life starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/events">
                <Button className="btn-share2care px-8 py-3 text-lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  Explore Events
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card> */}
        <div className="space-y-2 border p-5 rounded-3xl shadow-lg">
          <h3 className="font-semibold text-2xl text-center text-gray-900">
            Terms & Conditions
          </h3>
          <ul className="space-y-2 text-lg text-gray-700">
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                Elders sometimes find it difficult to connect with suitable
                person of similar age group and skills/interests of mutual
                liking, in nearby locality.
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                In order to find such company, Share2care Foundation has
                developed this application for elders of the society to get
                connected with elders having similar skills to live active
                social life.{" "}
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                By registering on this platform, you agree to follow the rules
                of the application{" "}
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                You will use this platform with very high moral, integrity, and
                respect to guest members.
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                You will not in any way harm other member of this platform.
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                There will be no financial involvement for joining such meeting.
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                Share2care Foundation shall be in no way be responsible for any
                misconduct of either party and/or financial transaction, if any.
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                On exchange of the contact number between Host and Guest(s),
                Share2care Foundation is not aware of any further development
                amongst them. Hence Share2care Foundation is not responsible for
                any activity amongst users of this platform and total
                responsibility is of Guest and the host.
              </span>
            </li>
          </ul>
          <p className="text-lg">
            Respect, honouring the opinions of others, warmth, morality,
            compassion and gratitude are some of the finely tuned rules of
            etiquette that all users shall follow in social interactions.
          </p>
        </div>
        <div className="flex flex-row mt-5 gap-4 justify-center">
          <Link to="/user">
            <Button className="btn-share2care px-8 py-3 text-lg">
              <User className="w-5 h-5 mr-2" />
              Are you ready to join
            </Button>
          </Link>
          <Link to="/events">
            <Button className="btn-share2care px-8 py-3 text-lg">
              <Calendar className="w-5 h-5 mr-2" />
              You want to explore
            </Button>
          </Link>
        </div>
      </div>

      {/* Share2care Footer */}
      <Footer />
    </div>
  );
}
