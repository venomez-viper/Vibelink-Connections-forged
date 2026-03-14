import Header from "@/components/Header";
import Footer from "@/components/website/Footer";
import { Card } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Page Title Section */}
      <section className="pt-40 pb-12 px-4 bg-background">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Terms of Service
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
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-6">
                By accessing and using VibeLink, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our service.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">2. User Eligibility</h2>
              <p className="text-muted-foreground mb-6">
                You must be at least 18 years old to use VibeLink. By creating an account, you represent and warrant that you meet this age requirement and that all information you provide is accurate and truthful.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">3. Account Responsibilities</h2>
              <p className="text-muted-foreground mb-6">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">4. User Conduct</h2>
              <p className="text-muted-foreground mb-6">
                You agree not to use VibeLink for any unlawful purpose or in any way that could damage, disable, or impair the service. Prohibited activities include harassment, impersonation, spam, and sharing inappropriate content.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">5. Content Rights</h2>
              <p className="text-muted-foreground mb-6">
                You retain ownership of content you post on VibeLink, but you grant us a license to use, modify, and display that content as necessary to provide our services. We reserve the right to remove any content that violates these terms.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">6. Termination</h2>
              <p className="text-muted-foreground mb-6">
                We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason we deem appropriate. You may also delete your account at any time through your account settings.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-6">
                VibeLink is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service, including but not limited to direct, indirect, or consequential damages.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">8. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We may update these terms from time to time. We will notify you of any material changes by posting the new terms on this page. Your continued use of VibeLink after such changes constitutes acceptance of the updated terms.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
