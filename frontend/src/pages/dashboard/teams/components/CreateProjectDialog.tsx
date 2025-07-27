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
import { useEffect, useState } from "react";
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
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/providers/authProvider";
import { Label } from "@/components/ui/label";

const CreateProjectDialog = ({ selectedTeam, onClose }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  // const [members, setMembers] = useState<string[]>([]);
  const { sessionInfo } = useAuth();

  const open = !!selectedTeam || searchParams.get("open") == "true";
  const [step, setStep] = useState(0);
  const [jiraProjects, setJiraProjects] = useState<any[]>([]);
  const [gitRepos, setGitRepos] = useState<any[]>([]);
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
    jira_project: z.string(),
    git_repo: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: searchParams.get("name") || "",
      description: searchParams.get("description") || "",
      jira_project: "",
      git_repo: "",
    },
  });

  useEffect(() => {
    const id = searchParams.get("id");
    const stepParam = searchParams.get("step");
    const shouldSetParams =
      (!id && selectedTeam?.id) || !searchParams.get("open") || !stepParam;

    if (selectedTeam || id) {
      if (shouldSetParams) {
        const newParams = new URLSearchParams(searchParams);
        if (!id && selectedTeam) newParams.set("id", selectedTeam.id);
        if (!searchParams.get("open")) newParams.set("open", "true");
        if (!stepParam) {
          setStep(0);
          form.reset();
          newParams.set("step", "0");
        }
        setSearchParams(newParams);
      }

      if (stepParam !== null) {
        const parsedStep = parseInt(stepParam, 10);
        if (!isNaN(parsedStep)) {
          form.reset();
          setStep(parsedStep);
        }
      }
    } else {
      setSearchParams({});
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (sessionInfo?.accessToken !== null) {
      if (open && jiraProjects.length == 0) {
        fetchJiraProjects();
      }
      if (open && gitRepos.length == 0) {
        fetchGitRepos();
      }
    }
  }, [sessionInfo?.accessToken, jiraProjects, gitRepos]);

  const fetchJiraProjects = async () => {
    await axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/jira/get-projects`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success !== false) {
          setJiraProjects(res.data);
        }
      });
  };

  const fetchGitRepos = async () => {
    await axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/github/get-repos`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success !== false) {
          setGitRepos(res.data);
        }
      });
  };

  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchParams({});
      form.reset();
      setStep(0);
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      searchParams.set("step", (step - 1).toString());
      setSearchParams(searchParams);
      setStep(step - 1);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (step < totalSteps - 1) {
        for (const [key, value] of Object.entries(values)) {
          if (key && value) {
            searchParams.set(key, value);
          }
        }
        searchParams.set("step", (step + 1).toString());
        setSearchParams(searchParams);
        setStep((prev) => prev + 1);

        if (step + 1 == totalSteps) {
          await fetchJiraProjects();
          await fetchGitRepos();
        }
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/project/add-project`,
          {
            ...values,
            team_id: selectedTeam.id,
          },
          {
            withCredentials: true,
          }
        );
        if (res.data) {
          setStep(0);
          new URLSearchParams(searchParams)
          setSearchParams({});
          onClose();
          form.reset();
          toast.success("Form successfully submitted");
        }
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
    <Dialog open={open} onOpenChange={handleDialogChange}>
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
                <div className="flex flex-row flex-1 gap-2 w-full">
                  <Label>Team: </Label>
                  <p>{selectedTeam?.name}</p>
                </div>
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
                {jiraProjects.length == 0 && (
                  <div className="grid flex-1 gap-2 w-full">
                    <Button
                      type="button"
                      onClick={() => {
                        const currentPath =
                          "http://localhost:5173" +
                          window.location.pathname +
                          window.location.search;
                        const authorizeUrl = `http://localhost:3000/api/jira/authorize?returnTo=${encodeURIComponent(
                          currentPath
                        )}`;
                        window.location.href = authorizeUrl;
                      }}
                    >
                      Connect to Jira
                    </Button>
                  </div>
                )}
                {jiraProjects.length > 0 && (
                  <div className="grid flex-1 gap-2 w-full">
                    <ProjectFormField
                      name="jira_project"
                      control={form.control}
                      label="Jira Project:"
                      formControl={(field) => (
                        <Select
                          onValueChange={(e) => {
                            field.onChange(e);
                          }}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="flex">
                            <SelectValue
                              placeholder={"Select Jira project to assign"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {jiraProjects.map((project) => {
                              return (
                                <SelectItem value={JSON.stringify(project)}>
                                  {project.name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                )}
                {gitRepos.length == 0 && (
                  <div className="grid flex-1 gap-2 w-full">
                    <Button
                      type="button"
                      onClick={() => {
                        const currentPath =
                          "http://localhost:5173" +
                          window.location.pathname +
                          window.location.search;
                        const authorizeUrl = `http://localhost:3000/api/github/authorize?returnTo=${encodeURIComponent(
                          currentPath
                        )}`;
                        window.location.href = authorizeUrl;
                      }}
                    >
                      Connect to GitHub
                    </Button>
                  </div>
                )}
                {gitRepos.length > 0 && (
                  <div className="grid flex-1 gap-2 w-full">
                    <ProjectFormField
                      name="git_repo"
                      control={form.control}
                      label="Github Repository:"
                      formControl={(field) => (
                        <Select
                          onValueChange={(e) => {
                            field.onChange(e);
                          }}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="flex">
                            <SelectValue
                              placeholder={"Select Github repository to assign"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {gitRepos.map((repo) => {
                              return (
                                <SelectItem value={JSON.stringify(repo)}>
                                  {repo.name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                )}
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
