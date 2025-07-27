import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  PlusIcon,
} from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import CreateProjectDialog from "./CreateProjectDialog";
import { Button } from "@/components/ui/button";
import jiraApi from "@/api/jira";

type Team = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  projects: [];
};

const TeamsList = () => {
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState([]);
  const token = localStorage.getItem("token") as string;
  const decodedToken = jwtDecode(token);

  const fetchTeams = async () => {
    const teamsApartOf = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/team/get-teams`,
      {
        params: {
          userId: userId,
        },
      }
    );
    setTeams(teamsApartOf.data);
  };

  const fetchProjects = async () => {
    const projectsApartOf = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/project/get-project`,
      {
        params: {
          userId: userId,
        },
      }
    );

    setProjects(projectsApartOf.data);
  };

  const userId =
    useSelector((state: any) => state.authReducer.id) || decodedToken.id;

  useEffect(() => {
    fetchTeams();
    fetchProjects();
  }, []);

  const toggleTeamExpansion = (teamId) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  return (
    <div className="flex-1 mx-auto rounded-md">
      {/* <div className="mb-8">
        <p className="text-gray-600">
          Managing {teams?.length ?? 0} teams with{" "}
          {teams?.reduce(
            (sum, team) => sum + (team.projects?.length ?? 0),
            0
          ) ?? 0}{" "}
          active projects
        </p>
      </div> */}

      <div className="space-y-4">
        <CreateProjectDialog
          selectedTeam={selectedTeam}
          onClose={() => setSelectedTeam(null)}
        />
        {teams.map((team) => {
          const isExpanded = expandedTeams.has(team.id);

          return (
            <div
              key={team.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleTeamExpansion(team.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {team.name}
                          <span className="text-sm text-gray-500 px-2">
                            ({team.memberCount} members)
                          </span>
                        </h2>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {team.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTeam(team);
                        }}
                        className="cursor-pointer"
                        variant={"default"}
                      >
                        Create Project
                        <PlusIcon />
                      </Button>

                      {(projects.length ?? 0) !== 0 && (
                        <div className="text-sm mt-3 font-medium text-gray-900">
                          {projects?.length ?? 0} project
                          {projects?.length ?? 0 !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50">
                  <div className="p-4 space-y-3">
                    {!projects && (
                      <div className="flex items-center justify-center mb-2">
                        <h3 className="font-medium text-gray-900">
                          No projects
                        </h3>
                      </div>
                    )}
                    {projects?.map((project) => (
                      <div
                        key={project?.id}
                        className="bg-white p-3 rounded-md border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">
                            {project?.name}
                          </h3>
                          <Button
                            type="button"
                            onClick={() => {
                              window.location.href = `http://localhost:5173/dashboard/insights/`;
                            }}
                          >
                            View Project Insights
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamsList;
