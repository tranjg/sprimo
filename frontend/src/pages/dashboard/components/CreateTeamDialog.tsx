import { InputTags } from "@/components/InputTags"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon } from "lucide-react"
import { useState } from "react"

const CreateTeamDialog = () => {
    const [members, setMembers] = useState<string[]>([]);
    return(
        <Dialog>
            <Button asChild>
          <DialogTrigger>
              Create Team
              <PlusIcon />
            </DialogTrigger>
            </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Team</DialogTitle>
              <DialogDescription>
              Create a team to track sprint progress and health.
              Add members, assign roles, and set a team lead to start monitoring key sprint metrics and improving performance.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-start gap-2">
              <div className="grid flex-1 gap-2 w-full">
                <Label>Team Name:</Label>
                <Input />
              </div>
              <div className="grid flex-1 gap-2 w-full">
                <Label>Team Description:</Label>
                <Textarea />
              </div>
              <div className="grid flex-1 gap-2 w-full">
                <Label>Add Members:</Label>
                <InputTags value={members} onChange={setMembers}/>
              </div>
            </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
          </DialogContent>
        </Dialog>
    )
}

export default CreateTeamDialog