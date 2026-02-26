import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Users,
  Shield,
  Globe,
  Award,
  Target,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Scale,
  HandHeart,
  BuildingIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "../components/Layout/Footer";
import Statecards from "@/components/Statecards";
import mission from "../../public/Images/mission.jpg";
import workGroup from "../../public/Images/work.webp";
import our from "../../public/Images/our.jpeg";
import SupportTeam from "@/components/SupportTeam";
import FAQs from "@/components/FAQs";

export default function AboutUs() {
  const stats = [
    { label: "Elders Served", value: "10,000+", icon: Users },
    { label: "Cities Covered", value: "50+", icon: MapPin },
    { label: "Years of Service", value: "5+", icon: Calendar },
    // { label: "Success Rate", value: "94%", icon: Star },
  ];

  const services = [
    {
      title: "Time Sharing for Elders",
      description:
        "Connecting seniors through meaningful activities and shared experiences",
      icon: Heart,
    },
    {
      title: "Community Support",
      description:
        "Building strong networks for elderly care and social interaction",
      icon: Users,
    },
    {
      title: "Health & Wellness",
      description:
        "Promoting physical and mental well-being through active engagement",
      icon: Shield,
    },
    {
      title: "Skill Development",
      description:
        "Encouraging lifelong learning and skill sharing among elders",
      icon: Award,
    },
    {
      title: "Social Activities",
      description:
        "Organizing events and activities to combat loneliness and isolation",
      icon: Globe,
    },
    {
      title: "Emergency Support",
      description: "Providing assistance and resources during times of need",
      icon: CheckCircle,
    },
  ];

  const team = [
    {
      name: "Dr. Rajesh Sharma",
      position: "Founder & Chairman",
      description:
        "Leading social worker with 20+ years of experience in elder care",
    },
    {
      name: "Mrs. Priya Gupta",
      position: "Director of Operations",
      description:
        "Expert in community development and social service management",
    },
    {
      name: "Mr. Vikram Singh",
      position: "Program Manager",
      description:
        "Specializes in elder engagement and community building programs",
    },
  ];

  const states = [
    { label: "Elders Served", value: "10,000+", icon: Users },
    { label: "Cities Covered", value: "50+", icon: MapPin },
    { label: "Years of Service", value: "5+", icon: Calendar },
    { label: "Success Rate", value: "94%", icon: Star },
  ];
  const faqs = [
    {
      question: "How can I join the Share2care platform?",
      answer:
        "You can join by clicking the 'User Login' button and completing the registration process. Please note, the platform is designed for individuals aged 60 and above.",
    },
    {
      question: "Is there any fee for using the platform?",
      answer:
        "No, Share2Care is completely free for elders. Our mission is to create an accessible, supportive community without any charges.",
    },
    {
      question: "How do I create or participate in a time-sharing event?",
      answer:
        "Once registered and approved, access the Events section to create your own event or browse and join upcoming events organized by other members.",
    },
    {
      question: "What safety and privacy measures does Share2Care have?",
      answer:
        "We verify all users through KYC documentation and enforce community guidelines to promote respectful and safe interactions. However, participants should exercise personal caution during offline meetings.",
    },
    {
      question: "Can I modify or cancel an event I created?",
      answer:
        "Yes, you can edit or cancel your events up to 24 hours before they start. We make sure to notify all participants promptly to minimize any inconvenience.",
    },
  ];

  return (
    <div className="h-screen bg-white overflow-x-hidden">
      <Header />

      <div className="w-full mt-32 py-2 px-8 flex flex-col bg-[#70363a] text-white justify-center items-center mb-5">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">About Us</h2>
        <hr className="h-0.5 bg-white text-white w-full max-w-36" />
      </div>

      <div className=" mx-auto  md:px-8 max-w-7xl">
        {/* Hero */}
        <section className="relative py-5 sm:px-6 md:px-8 bg-gradient-to-br from-red-50 to-yellow-50 rounded-3xl mb-5">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              {/* <Badge className="mb-6 px-6 py-3 text-base font-medium bg-yellow-500 text-share2care-red border-red-200">
                <BuildingIcon/><span className="ml-2">About Our Foundation</span> 
              </Badge> */}
              <h1 className="text-2xl sm:text-2xl lg:text-2xl font-semibold share2care-primary-text mb-3 leading-tight">
                What We Do
                {/* <span className="share2care-primary-text">
                  Share2care Foundation
                </span> */}
              </h1>
              <p className="text-lg sm:text-md text-gray-600 mb-5 leading-relaxed">
                We are extending consultation, expert’s guidance & support by
                making it easily accessible & very affordable, which is in the
                interest of people to enable them for dealing with personal,
                social,educational, business, legal and other issues.
                <br />
                The field of Social Service is expanding day by day. We attempt
                to relieve and prevent hardship and suffering of individuals,
                families, groups and communities through operation of
                appropriate services and by contributing to social planning. We
                found that our support initially may help either by Counselling
                or consultation in various fields like Education & Career
                development, issues related to Psychological problems, help to
                Senior Citizens, Health Care guidance, Financial & Business
                Management, Skill Development, Woman empowerment, Rural
                development etc. Issues not resolved shall be taken due care
                subsequently.
              </p>
              {/* <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/user">
                  <Button size="lg" className="btn-share2care w-full sm:w-auto">
                    Join Our Community
                  </Button>
                </Link>
                <Link to="/donation">
                  <Button size="lg" className="btn-share2care w-full sm:w-auto">
                    Support Our Cause
                  </Button>
                </Link>
              </div> */}
            </div>
            <div className="relative w-full">
              <div className="rounded-2xl overflow-hidden w-full">
                <iframe
                  src="https://www.youtube.com/embed/QhxF4OsNS70"
                  title="Share2care Foundation Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-[220px] md:h-[400px]"
                ></iframe>
              </div>

              {/* this part is Hidden for Now If Needed Add md:block class*/}
              {/* <div className="hidden absolute -bottom-6 -left-1 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">10,000+</p>
                    <p className="text-sm text-gray-600">Elders Served</p>
                  </div>
                </div>
              </div>
              <div className="hidden absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">5+ Years</p>
                    <p className="text-sm text-gray-600">Of Service</p>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-3">
          <Card className="share2care-card">
            <div className="mt-3 mb-3 border rounded-2xl">
              <img
                src={our}
                alt="Who we are"
                className="w-full h-48 object-cover rounded-2xl"
              />
            </div>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-share2care-red rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-2xl lg:text-2xl font-semibold leading-tight">
                  Who we are
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg sm:text-md text-gray-600 leading-relaxed">
                Share2care Social Services Foundation is a company registered as
                Non-profit Non-Government Organisation under Section 8 of the
                Companies Act, 2013, which pertains ‘for promoting commerce,
                art, science, sports, education, research, social welfare,
                religion, charity, protection of environment or any such other
                object’. This foundation is registered at Delhi and working all
                over India.
              </p>
              <br />
              <p className="text-lg sm:text-md text-gray-600 leading-relaxed">
                We are group of talented, educated & committed professionals,
                from various walks of life, having a wish to help the Society.
                Our aim is to make life stress free for each one.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-primary rounded-3xl p-5">
            <div className="mt-3 mb-3 rounded-2xl">
              <img
                src={mission}
                alt="our mission"
                className="w-full h-48 object-cover rounded-2xl"
              />
            </div>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-share2care-red" />
                </div>
                <CardTitle className="text-2xl sm:text-2xl lg:text-2xl font-semibold leading-tight text-white">
                  Our mission
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg sm:text-md text-white leading-relaxed">
                Improve the quality of life of needy, by extending support for
                resolving issues causing stress, depression, isolation etc.,
                which may be due to insufficient resources or economic hardship
                or otherwise.
              </p>
            </CardContent>
          </Card>
          <Card className="share2care-card">
            <div className="mt-3 mb-3 border rounded-2xl">
              <img
                src={workGroup}
                alt="working"
                className="w-full h-48 object-cover rounded-2xl"
              />
            </div>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-share2care-red rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-2xl lg:text-2xl font-semibold leading-tight">
                  For whom, we are working
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg sm:text-md text-gray-600 leading-relaxed">
                As it is known that not everyone on this earth is bestowed with
                all the happiness that life has to offer. Anyone, poor or rich,
                sufferer & struggling with challenges of life can approach us
                for resolving the issues by experts in their respective field,
                utilising online facilities at share2care.co. We shall be change
                agents in the lives of the individuals, families and communities
                by utilizing variety of skills, techniques, and activities
                consistent with focus on persons and their environments.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        {/* <Statecards states={states}/> */}

        {/* Hero */}
        <section className="relative mt-3 py-3 sm:px-6 md:px-8 bg-gradient-to-br from-red-50 to-yellow-50 rounded-3xl mb-3">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              {/* <Badge className="mb-6 px-6 py-3 text-base font-medium bg-yellow-500 text-share2care-red border-red-200">
                <BuildingIcon/><span className="ml-2">About Our Foundation</span> 
              </Badge> */}
              <h1 className="text-2xl sm:text-2xl lg:text-2xl font-semibold leading-tight">
                Why join Share2care
                {/* <span className="share2care-primary-text">
                  Share2care Foundation
                </span> */}
              </h1>
              <p className="text-lg sm:text-md text-gray-600 leading-relaxed">
                We are extending consultation, expert’s guidance & support by
                making it easily accessible & very affordable, which is in the
                interest of people to enable them for dealing with personal,
                social,educational, business, legal and other issues. <br />{" "}
                <br />
                The field of Social Service is expanding day by day. We attempt
                to relieve and prevent hardship and suffering of individuals,
                families, groups and communities through operation of
                appropriate services and by contributing to social planning. We
                found that our support initially may help either by Counselling
                or consultation in various fields like Education & Career
                development, issues related to Psychological problems, help to
                Senior Citizens, Health Care guidance, Financial & Business
                Management, Skill Development, Woman empowerment, Rural
                development etc. Issues not resolved shall be taken due care
                subsequently.
              </p>
              <p className="text-lg sm:text-md text-gray-600 leading-relaxed">
                Please feel free to submit your issues / enquiry to our team of
                expert in different fields and get peace of mind.
              </p>
            </div>
            <div className="relative w-full">
              <div className="rounded-2xl overflow-hidden w-full">
                <img
                  src="https://share2care.co/wp-content/uploads/2022/11/Join-Us-min.png"
                  alt=""
                  className="w-full h-[220px] md:h-[400px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Support Hours */}
        <SupportTeam />
        {/*faqs*/}
        <FAQs faqs={faqs} />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}
