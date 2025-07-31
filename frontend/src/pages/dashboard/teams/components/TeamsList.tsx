import React, { useEffect, useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Users,
  PlusIcon,
} from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import CreateProjectDialog from "./CreateProjectDialog";
import { Button } from "@/components/ui/button";

type Team = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
};

type Project = {
  id: string;
  name: string;
  team_id: string;
};

const TeamsList = () => {
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const token = localStorage.getItem("token") as string;
  const decodedToken = jwtDecode(token);
  const userId =
    useSelector((state: any) => state.authReducer.id) || decodedToken.id;

  useEffect(() => {
    const fetchTeams = async () => {
      const teamsApartOf = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/team/get-teams`,
        {
          params: { userId },
        }
      );
      setTeams(teamsApartOf.data);
    };

    const fetchProjects = async () => {
      const projectsApartOf = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/project/get-project`,
        {
          params: { userId },
        }
      );
      setProjects(projectsApartOf.data);
    };

    fetchTeams();
    fetchProjects();
  }, [userId]);

  const toggleTeamExpansion = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    newExpanded.has(teamId)
      ? newExpanded.delete(teamId)
      : newExpanded.add(teamId);
    setExpandedTeams(newExpanded);
  };

  const projectsByTeam = useMemo(() => {
    const grouped: Record<string, Project[]> = {};
    projects.forEach((project) => {
      const teamId = project.team_id;
      if (!grouped[teamId]) grouped[teamId] = [];
      grouped[teamId].push(project);
    });
    return grouped;
  }, [projects]);

  return (
    <div className="flex-1 mx-auto rounded-md space-y-4">
      <CreateProjectDialog
        selectedTeam={selectedTeam}
        onClose={() => setSelectedTeam(null)}
      />
      {teams.map((team) => {
        const isExpanded = expandedTeams.has(team.id);
        const teamProjects = projectsByTeam[team.id] ?? [];

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

                <div className="text-right">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTeam(team);
                    }}
                    className="cursor-pointer"
                    variant={"default"}
                  >
                    Create Project <PlusIcon className="ml-1" />
                  </Button>

                  <div className="text-sm mt-3 font-medium text-gray-900">
                    {teamProjects.length} project
                    {teamProjects.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50">
                <div className="p-4 space-y-3">
                  {teamProjects.length === 0 ? (
                    <div className="flex items-center justify-center mb-2">
                      <h3 className="font-medium text-gray-900">No projects</h3>
                    </div>
                  ) : (
                    teamProjects.map((project) => (
                      <div
                        key={project.id}
                        className="bg-white p-3 rounded-md border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">
                            {project.name}
                          </h3>
                          <Button
                            type="button"
                            onClick={() => {
                              window.location.href = `http://localhost:5173/dashboard/insights`;
                            }}
                          >
                            View Project Insights
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TeamsList;
