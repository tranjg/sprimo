import { InputTags } from "@/components/InputTags"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import { z } from "zod"

const CreateTeamDialog = () => {
    // const [members, setMembers] = useState<string[]>([]);

    
    const token = localStorage.getItem("token") as string
    
    const decodedToken = jwtDecode(token)

    const userId = useSelector((state: any) => state.authReducer.id) || decodedToken.id

    const formSchema = z.object({
      name: z.string().min(2, {message: "Must be 2 or more characters long"}).max(50, {message: "Must be 50 or fewer characters long"}),
      description: z.string().min(2, {message: "Must be 2 or more characters long"}).max(250, {message: "Must be 250 or fewer characters long"}),
    })

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        description: ""
      }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/team/add-team`, {
          ...values,
          created_by: userId
        })
        if (res.data) {
          toast.success('Successfully added a team.')
        }
      } catch (error: any) {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message || 'Failed to submit the form. Please try again.';
          toast.error(errorMessage);
        } else {
          toast.error('Failed to add a team. Please try again.');
        }
      }  
    }

    return(
        <Dialog>
            <Button asChild>
          <DialogTrigger>
              Create Team
              <PlusIcon />
            </DialogTrigger>
            </Button>
          <DialogContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create Team</DialogTitle>
              <DialogDescription>
              Create a team to track sprint progress and health.
              Add members, assign roles, and set a team lead to start monitoring key sprint metrics and improving performance.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-start gap-4 mt-3 py-4">
              <div className="grid flex-1 gap-2 w-full">
                <FormField
                  control={form.control}
                  name="name"
                  render={({field}) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="name">Team Name:</FormLabel>
                      <FormControl>
                        <Input id="name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid flex-1 gap-2 w-full">
                <FormField
                  control={form.control}
                  name="description"
                  render={({field}) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="description">Team Description:</FormLabel>
                      <FormControl>
                        <Textarea id="description" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              {/* <div className="grid flex-1 gap-2 w-full">
                <Label>Add Members:</Label>
                <InputTags value={members} onChange={setMembers}/>
              </div> */}
            </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
          </form>
          </Form>
          </DialogContent>
        </Dialog>
    )
}

export default CreateTeamDialog