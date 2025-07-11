import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";
import { ProjectFormField } from "./ProjectFormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateProjectDialog = ({ teams }) => {
  // const [members, setMembers] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const totalSteps = 2;

  const token = localStorage.getItem("token") as string;
  const decodedToken = jwtDecode(token);

  const userId =
    useSelector((state: any) => state.authReducer.id) || decodedToken.id;

  const formSchema = z.object({
    name: z
      .string()
      .min(2, { message: "Must be 2 or more characters long" })
      .max(50, { message: "Must be 50 or fewer characters long" }),
    description: z
      .string()
      .min(2, { message: "Must be 2 or more characters long" })
      .max(250, { message: "Must be 250 or fewer characters long" })
      .optional()
      .or(z.literal("")),
    team: z
      .string({
        required_error: "Please select a team to assign.",
      })
      .min(1, { message: "Please select an option." }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      team: "",
    },
  });

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // const res = await axios.post(
      //   `${import.meta.env.VITE_BACKEND_URL}/api/team/add-team`,
      //   {
      //     ...values,
      //     created_by: userId,
      //   }
      // );
      // if (res.data) {
      //   setOpen(false);
      //   toast.success("Successfully added a team.");
      //   form.reset();
      // }
      if (step < totalSteps - 1) {
        setStep(step + 1);
      } else {
        console.log(values);
        setStep(0);
        form.reset();

        toast.success("Form successfully submitted");
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message ||
          "Failed to submit the form. Please try again.";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to add a team. Please try again.");
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open);
        form.reset();
      }}
    >
      <Button asChild className="cursor-pointer" variant={"default"}>
        <DialogTrigger>
          Create Project
          <PlusIcon />
        </DialogTrigger>
      </Button>
      <DialogContent>
        {step == 0 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>
                  Name your project and select the team it belongs to. Add a
                  short description if needed.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-start gap-4 mt-6">
                <div className="grid flex-1 gap-2 w-full">
                  <ProjectFormField
                    name="name"
                    control={form.control}
                    label="Project Name:"
                    formControl={(field) => <Input id="name" {...field} />}
                  />
                </div>
                <div className="grid flex-1 gap-2 w-full">
                  <ProjectFormField
                    name="description"
                    control={form.control}
                    label="Project Description:"
                    formControl={(field) => (
                      <Textarea id="description" {...field} />
                    )}
                  />
                </div>
                <div className="grid flex-1 gap-2 w-full">
                  <ProjectFormField
                    name="team"
                    control={form.control}
                    label="Team:"
                    formControl={(field) => (
                      <Select
                        onValueChange={(e) => {
                          field.onChange(e);
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={"Select team to assign"} />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => {
                            return (
                              <SelectItem value={team.id}>
                                {team.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {/* <div className="grid flex-1 gap-2 w-full">
                <Label>Add Members:</Label>
                <InputTags value={members} onChange={setMembers}/>
              </div> */}
              </div>
              <DialogFooter className="grid grid-cols-3 items-center w-full mt-6">
                <Button
                  type="button"
                  size={"lg"}
                  onClick={handleBack}
                  disabled={step === 0}
                >
                  Back
                </Button>
                <span className="text-center">
                  {step + 1}/{totalSteps}
                </span>
                <Button size={"lg"} type="submit">
                  {step === 1 ? "Submit" : "Next"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
        {step == 1 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Integrations</DialogTitle>
                <DialogDescription>
                  Connect your Jira board and GitHub repo to sync sprint and
                  development data.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-start gap-4 mt-6">
                <div className="grid flex-1 gap-2 w-full">
                  <ProjectFormField
                    name="name"
                    control={form.control}
                    label="Project Name:"
                    formControl={(field) => <Input id="name" {...field} />}
                  />
                </div>
                <div className="grid flex-1 gap-2 w-full">
                  <ProjectFormField
                    name="description"
                    control={form.control}
                    label="Project Description:"
                    formControl={(field) => (
                      <Textarea id="description" {...field} />
                    )}
                  />
                </div>
                {/* <div className="grid flex-1 gap-2 w-full">
                <Label>Add Members:</Label>
                <InputTags value={members} onChange={setMembers}/>
              </div> */}
              </div>
              <DialogFooter className="grid grid-cols-3 items-center w-full mt-6">
                <Button
                  type="button"
                  size={"lg"}
                  onClick={handleBack}
                  disabled={step === 0}
                >
                  Back
                </Button>
                <span className="text-center">
                  {step + 1}/{totalSteps}
                </span>
                <Button size={"lg"} type="submit">
                  {step === 1 ? "Submit" : "Next"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
