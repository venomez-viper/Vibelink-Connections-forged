import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Page Title Section */}
      <section className="pt-40 pb-12 px-4 bg-background">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Last updated: March 2024
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-6">
                We collect information you provide directly to us, such as your name, email address, photos, and profile information. We also collect information about your use of our services, including messages, matches, and interactions with other users.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-6">
                We use your information to provide, maintain, and improve our services, including matching you with compatible users, personalizing your experience, and communicating with you about our services. We may also use your information for safety and security purposes.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">3. Information Sharing</h2>
              <p className="text-muted-foreground mb-6">
                We do not sell your personal information. We may share your information with other users as part of the matching service, with service providers who help us operate our platform, and when required by law or to protect our rights and users' safety.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
              <p className="text-muted-foreground mb-6">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">5. Your Rights</h2>
              <p className="text-muted-foreground mb-6">
                You have the right to access, update, or delete your personal information at any time through your account settings. You can also request a copy of your data or object to certain processing activities by contacting us.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">6. Cookies and Tracking</h2>
              <p className="text-muted-foreground mb-6">
                We use cookies and similar tracking technologies to collect information about your browsing activities and to provide personalized experiences. You can control cookies through your browser settings.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">7. Children's Privacy</h2>
              <p className="text-muted-foreground mb-6">
                VibeLink is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">8. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
