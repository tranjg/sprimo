import Layout from "./layout.tsx";
import { Button } from "../../components/ui/button.tsx";
import { PlusIcon } from "lucide-react";
import { SprintBurndownChart } from "../../components/SprintBurndownChart.tsx";
import { WorkItemFlowChart } from "../../components/WorkItemFlowChart.tsx";
import { SprintGoalCompletionChart } from "../../components/SprintGoalCompletionChart.tsx";
import { VelocityChart } from "../../components/VelocityChart.tsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";

function Home() {
  return (
    <Layout>
      <div className="flex-1 p-2">
        <div className="flex p-4 border-1 rounded-md justify-end bg-sidebar">
        <Dialog>
          <DialogTrigger>
            <Button>
              Create Team
              <PlusIcon />
            </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Team</DialogTitle>
              <DialogDescription>
              Create a team to track sprint progress and health.
              Add members, assign roles, and set a team lead to start monitoring key sprint metrics and improving performance.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-start gap-2">
              <div className="grid flex-1 gap-2">
                <Label>Team Name:</Label>
                <Input />
              </div>
              <div className="grid flex-1 gap-2">
                <Label>Team Lead:</Label>
                <Input />
              </div>
            </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
        <div className="flex lg:flex-row flex-col gap-4 mt-4 p-4 border-1 rounded-md h-full">
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
