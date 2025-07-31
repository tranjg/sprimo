import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-background px-4 py-8">
      {/* Top Navigation */}
      <div className="w-full text-xl border-b py-4 fixed top-0 bg-background z-10 p-3">
        <h1>Sprimo</h1>
      </div>
      {/* Hero Content */}
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mt-16">
        <h1 className="text-4xl font-extrabold tracking-tight leading-tight sm:text-5xl">
          Track Sprint Health. Unblock Your Team.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A unified dashboard for Agile teams to monitor progress, identify
          blockers early, and align better—across GitHub, Jira, and Slack.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex gap-4">
          <Button asChild>
            <Link to="/register">Get Started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login">Log In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
