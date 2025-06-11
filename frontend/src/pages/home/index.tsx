import Layout from "./layout.tsx";
import { Button } from "../../components/ui/button.tsx";
import { PlusIcon } from "lucide-react";
import { SprintBurndownChart } from "../../components/SprintBurndownChart.tsx";
import { WorkItemFlowChart } from "../../components/WorkItemFlowChart.tsx";
import { SprintGoalCompletionChart } from "../../components/SprintGoalCompletionChart.tsx";
import { VelocityChart } from "../../components/VelocityChart.tsx";

function Home() {
  return (
    <Layout>
      <div className="flex-1 p-2">
        <div className="flex p-4 border-1 rounded-md justify-end bg-sidebar">
          <Button>
            Create Team
            <PlusIcon />
          </Button>
        </div>
        <div className="flex flex-row gap-4 mt-4 p-4 border-1 rounded-md h-full">
          <div className="flex flex-col basis-1/2 p-4 gap-4 h-full">
            <VelocityChart />
            <SprintGoalCompletionChart />
          </div>
          <div className="flex flex-col basis-1/2 p-4 gap-4 h-full">
            <SprintBurndownChart />
            <WorkItemFlowChart />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Home;
