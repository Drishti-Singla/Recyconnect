import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { 
  Gift, 
  Search, 
  MessageCircle, 
  Leaf, 
  Shield, 
  Zap, 
  MapPin,
  ChevronDown,
  Heart,
  Users,
  Globe
} from "lucide-react";

const Landing = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `linear-gradient(135deg, hsl(199 89% 35% / 0.95), hsl(142 71% 35% / 0.9)), 
                             url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1920&q=80')`
          }}
        />
        
        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        </div>

        <div className="container relative z-10 px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground leading-tight">
              Recy<span className="text-secondary">Connect</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
              RecyConnect is a platform designed to connect people who want to recycle, donate, 
              or find lost items within their community. Our goal is to promote sustainability, 
              reduce waste, and help people make a positive impact by sharing resources and 
              supporting each other. Join us in building a cleaner, greener, and more connected world!
            </p>
            <div className="flex justify-center pt-4">
              <Link to="/signup">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Get Started
                  <Leaf className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <button 
            onClick={() => scrollToSection("how-it-works")}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-primary-foreground/80 hover:text-primary-foreground transition-colors animate-bounce"
          >
            <ChevronDown className="w-10 h-10" />
          </button>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        id="how-it-works" 
        className="relative py-24 md:py-32 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)`
        }}
      >
        <div className="container px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to start making a difference in your community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Gift,
                title: "Donate",
                description: "List items you no longer need and give them a second life. Help reduce waste while helping others.",
                color: "bg-primary",
                delay: "0s",
              },
              {
                icon: Search,
                title: "Discover",
                description: "Browse available items and connect with donors nearby. Find exactly what you need sustainably.",
                color: "bg-secondary",
                delay: "0.1s",
              },
              {
                icon: MessageCircle,
                title: "Connect",
                description: "Message directly through our real-time chat system. Arrange pickups and build community bonds.",
                color: "bg-primary",
                delay: "0.2s",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group relative bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: item.delay }}
              >
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why RecyConnect Section */}
      <section 
        className="relative py-24 md:py-32"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(199 89% 40% / 0.95), hsl(142 71% 40% / 0.9)), 
                           url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&q=80')`,
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Why RecyConnect?
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Join thousands of community members making a positive impact
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Leaf,
                title: "Eco-Friendly",
                description: "Reduce waste and promote sustainability",
              },
              {
                icon: Shield,
                title: "Secure",
                description: "Community-driven and verified users",
              },
              {
                icon: Zap,
                title: "Real-Time",
                description: "Instant notifications and live chat",
              },
              {
                icon: MapPin,
                title: "Lost & Found",
                description: "Reunite items with their owners",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-primary-foreground/10 backdrop-blur-lg rounded-2xl p-6 border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-primary-foreground/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold text-primary-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-primary-foreground/80 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-card">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Built With Modern Technology
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powered by cutting-edge technologies for optimal performance and reliability
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "React", label: "Frontend Framework" },
              { value: "Node.js", label: "Backend Runtime" },
              { value: "PostgreSQL", label: "Database" },
              { value: "Socket.io", label: "Real-time Chat" },
              { value: "Express", label: "Backend Framework" },
              { value: "TypeScript", label: "Type Safety" },
              { value: "Cloudinary", label: "Image Storage" },
              { value: "JWT", label: "Authentication" },
            ].map((tech, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {tech.value}
                </div>
                <p className="text-muted-foreground text-sm">{tech.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section 
        className="relative py-24 md:py-32"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(199 89% 30% / 0.95), hsl(142 71% 30% / 0.9)), 
                           url('https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=1920&q=80')`,
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-8">
              Our Mission
            </h2>
            <div className="space-y-6 text-primary-foreground/90 text-lg leading-relaxed">
              <p>
                At RecyConnect, we believe in the power of community to create lasting change. 
                Our mission is to build a platform that makes sustainability accessible and 
                rewarding for everyone.
              </p>
              <p>
                We're committed to reducing landfill waste by giving items a second life, 
                connecting people who can benefit from each other's resources, and fostering 
                a culture of sharing and caring within educational communities.
              </p>
              <p>
                Together, we can create a cleaner, greener world — one donation at a time.
              </p>
            </div>
            <Link to="/signup" className="inline-block mt-10">
              <Button variant="hero" size="xl">
                Join Our Mission
                <Leaf className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-muted to-background">
        <div className="container px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Join RecyConnect today and start contributing to a more sustainable community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="xl">Create Account</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="xl">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Landing;
