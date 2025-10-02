
import { Card } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen pt-20 px-4" style={{ backgroundColor: "#9966cc" }}>
      <Card className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-semibold mb-6">About Aitodidactia</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <p>
            Aitodidactia began partly as an academic exercise, but mostly to serve an emerging human need to develop mental strength and fitness in a demanding modern world.
          </p>

          <p>
            We are a team of developers, AI Prompt engineers, teachers, public speakers, personal coaches, and researchers who share the human values of personal development, equality and charity.
          </p>

          <p className="font-medium">
            We are Building Something Brilliant, in order to help People.
          </p>

          <p className="italic">
            Feel free to call Aito for a chat about us…
          </p>

          <div className="pt-6">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">What is Aito</h2>
            <div className="space-y-4">
              <p>
                Aito is an online personal development platform with a difference. It encourages users to approach significant personal change by regularly, week to week, using bite sized pieces of guided self-discovery as a platform to create change in their lives.
              </p>

              <p>
                The Aito service learns from real, anonymous, examples from actual users which are actively validated against established philosophies. This makes Aito's knowledge and suggestions as relevant as they can be for a modern audience.
              </p>

              <p>
                And why is it different? Books, search engines, podcasts although useful are not directed, and not specific. The reader or listener is left to process lots of information, sift it, and then convert that information into something that they may or may not be able to implement in their lives. Aito works with the user one-to-one to pinpoint an area of life or mental fitness to be strengthened, shares specific bite sized Precepts that the user can grasp manageably, helps them to set an intention to work towards. This is, like most things in life, an ongoing process; so Aito regularly meets with the user to maintain progress.
              </p>

              <p className="italic pt-4">
                Feel free to call Aito for a chat if you want to know more…
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default About;
