import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Features() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CareShare
              </span>
            </Link>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Comprehensive Features for Complete Care
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything your family needs to coordinate, communicate, and provide
            the best possible care for your loved ones.
          </p>
        </div>

        <Card className="p-8">
          <CardHeader>
            <CardTitle className="text-2xl">
              🚧 Features Page Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              We're working hard to bring you detailed information about all our
              features. This page will include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
              <li>Detailed feature descriptions and screenshots</li>
              <li>How-to guides and tutorials</li>
              <li>Feature comparison charts</li>
              <li>Integration capabilities</li>
              <li>Mobile app features</li>
            </ul>
            <Link to="/dashboard">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Explore Dashboard Preview
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
