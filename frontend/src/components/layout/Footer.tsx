import { Link } from "react-router-dom";
import { Recycle, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Recycle className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-background">
                RecyConnect
              </span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              Building a cleaner, greener, and more connected world through 
              community-driven recycling and resource sharing.
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-background/80 text-xs font-semibold mb-2">Drishti Singla</p>
                <div className="flex gap-3">
                  <a
                    href="https://github.com/Drishti-Singla"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300"
                    title="Drishti's GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/drishti-singla-a3881a29a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300"
                    title="Drishti's LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <div>
                <p className="text-background/80 text-xs font-semibold mb-2">Astha Balda</p>
                <div className="flex gap-3">
                  <a
                    href="https://github.com/Astha-Balda"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300"
                    title="Astha's GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/astha-balda-40735b291?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300"
                    title="Astha's LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {["About Us", "How It Works", "Donate Items", "Lost & Found", "Contact"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="#"
                      className="text-background/70 hover:text-primary transition-colors text-sm"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/terms"
                  className="text-background/70 hover:text-primary transition-colors text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-background/70 hover:text-primary transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-background/70 hover:text-primary transition-colors text-sm"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/feedback"
                  className="text-background/70 hover:text-primary transition-colors text-sm"
                >
                  Give Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-background/70 text-sm">
                  Chitkara University, Punjab, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <div className="flex flex-col gap-1">
                  <a
                    href="mailto:drishtisingla868@gmail.com"
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    drishtisingla868@gmail.com
                  </a>
                  <a
                    href="mailto:asthabalda777@gmail.com"
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    asthabalda777@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <div className="flex flex-col gap-1">
                  <a
                    href="tel:+916239336010"
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    +91 6239336010
                  </a>
                  <a
                    href="tel:+917027050244"
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    +91 70270 50244
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/20 flex justify-center items-center">
          <p className="text-background/60 text-sm">
            © {new Date().getFullYear()} RecyConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
