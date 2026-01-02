import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container px-4 max-w-4xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="bg-card rounded-2xl p-8 md:p-12 shadow-elevated">
            <h1 className="font-display text-4xl font-bold text-foreground mb-8">
              Terms & Conditions
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">
                Last updated: January 2024
              </p>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  By accessing and using RecyConnect, you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please 
                  do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  2. Use License
                </h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Permission is granted to temporarily access RecyConnect for personal, 
                  non-commercial transitory viewing only. This is the grant of a license, 
                  not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to decompile or reverse engineer any software</li>
                  <li>Remove any copyright or other proprietary notations</li>
                  <li>Transfer the materials to another person</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  3. User Accounts
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  To access certain features of RecyConnect, you must register for an account using 
                  a valid @chitkara.edu.in email address and your assigned college code. You are 
                  responsible for maintaining the confidentiality of your account and password. 
                  You agree to accept responsibility for all activities that occur under your account.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  4. Community Guidelines
                </h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Users must adhere to our community guidelines which include:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                  <li>Treating all users with respect and courtesy</li>
                  <li>Providing accurate and honest information about items</li>
                  <li>Not posting inappropriate, offensive, or illegal content</li>
                  <li>Not attempting to scam or deceive other users</li>
                  <li>Respecting the privacy of other users</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  5. Donations and Transactions
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  RecyConnect facilitates the donation and exchange of items between users. 
                  All items listed must be legal to own and transfer. RecyConnect does not take 
                  responsibility for the quality, safety, or legality of items listed. Users are 
                  responsible for verifying items before accepting donations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  6. Privacy Policy
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  Your privacy is important to us. We collect and use personal information only 
                  as described in our Privacy Policy. By using RecyConnect, you consent to the 
                  collection and use of information in accordance with our policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  7. Disclaimer
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  The materials on RecyConnect are provided on an 'as is' basis. RecyConnect makes 
                  no warranties, expressed or implied, and hereby disclaims and negates all other 
                  warranties including, without limitation, implied warranties or conditions of 
                  merchantability, fitness for a particular purpose, or non-infringement of 
                  intellectual property.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  8. Limitations
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  In no event shall RecyConnect or its suppliers be liable for any damages 
                  (including, without limitation, damages for loss of data or profit, or due to 
                  business interruption) arising out of the use or inability to use the materials 
                  on RecyConnect.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  9. Account Termination
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  RecyConnect reserves the right to suspend or terminate user accounts that violate 
                  these terms or our community guidelines. Users may also delete their own accounts 
                  at any time through the dashboard settings.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  10. Modifications
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  RecyConnect may revise these terms of service at any time without notice. 
                  By using this website you are agreeing to be bound by the then current version 
                  of these terms of service.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  11. Contact Information
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  If you have any questions about these Terms & Conditions, please contact us at:
                  <br />
                  <a href="mailto:support@recyconnect.com" className="text-primary hover:underline">
                    support@recyconnect.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
