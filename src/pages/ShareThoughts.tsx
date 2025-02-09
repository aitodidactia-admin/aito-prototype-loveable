
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ShareThoughts = () => {
  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Share Your Thoughts</CardTitle>
          <CardDescription>Connect with us and help shape the future of Aito</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">What Can You Do Here?</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Join the Beta Test</h3>
                <p className="text-muted-foreground">
                  Just send us your first name and email address, and one of the team will be in touch. 
                  It's free to join and use the Aito Beta Test, but contributions are extremely important 
                  in supporting our development and running costs. If you feel you'd like to help, please 
                  use the 'Donate' Button above…
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Send us Feedback</h3>
                <p className="text-muted-foreground">
                  We're continually evolving Aito based on your comments. We love to hear good things, 
                  but we can only make Aito work better for you by hearing the things we need to work on...
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Want to Work with Us</h3>
                <p className="text-muted-foreground">
                  Aito can be configured with ANY content, and is an excellent coaching and training 
                  platform for soft skills in particular. Reach out if you'd like to know more..
                </p>
              </div>

              <div className="mt-6">
                <p className="text-muted-foreground italic">
                  You can also reach us through Aito – he'll pass on your message to the team.
                </p>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareThoughts;
