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

const TeamsList = () => {
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const token = localStorage.getItem("token") as string;
  const decodedToken = jwtDecode(token);

  type Team = {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    projects: [];
  };

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

  const userId =
    useSelector((state: any) => state.authReducer.id) || decodedToken.id;

  useEffect(() => {
    fetchTeams();
  }, []);

  // const teams = [
  //   {
  //     id: 1,
  //     name: "Frontend Development",
  //     description: "Responsible for user interface design, web application development, and mobile app creation using React, Vue, and React Native.",
  //     memberCount: 6,
  //     projects: [
  //       { id: 1, name: "E-commerce Redesign", sprintHealth: "healthy", completion: 85 },
  //       { id: 2, name: "Mobile App v2.0", sprintHealth: "at-risk", completion: 60 },
  //       { id: 3, name: "Component Library", sprintHealth: "healthy", completion: 92 }
  //     ]
  //   },
  //   {
  //     id: 2,
  //     name: "Backend Services",
  //     description: "Manages server-side logic, database operations, API development, and microservices architecture using Node.js and Python.",
  //     memberCount: 4,
  //     projects: [
  //       { id: 4, name: "API Gateway Upgrade", sprintHealth: "critical", completion: 35 },
  //       { id: 5, name: "Database Migration", sprintHealth: "healthy", completion: 78 }
  //     ]
  //   },
  //   {
  //     id: 3,
  //     name: "DevOps & Infrastructure",
  //     description: "Handles deployment pipelines, cloud infrastructure, monitoring systems, and security implementations across all environments.",
  //     memberCount: 3,
  //     projects: [
  //       { id: 6, name: "CI/CD Pipeline", sprintHealth: "at-risk", completion: 45 },
  //       { id: 7, name: "Monitoring Setup", sprintHealth: "healthy", completion: 88 },
  //       { id: 8, name: "Security Audit", sprintHealth: "blocked", completion: 20 }
  //     ]
  //   },
  //   {
  //     id: 4,
  //     name: "QA & Testing",
  //     description: "Ensures product quality through automated testing, manual testing, performance testing, and continuous quality assurance processes.",
  //     memberCount: 5,
  //     projects: [
  //       { id: 9, name: "Automated Testing Suite", sprintHealth: "healthy", completion: 95 },
  //       { id: 10, name: "Performance Testing", sprintHealth: "healthy", completion: 70 }
  //     ]
  //   }
  // ];

  const toggleTeamExpansion = (teamId) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "at-risk":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "critical":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "blocked":
        return <Clock className="w-4 h-4 text-purple-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200";
      case "at-risk":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "blocked":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOverallTeamHealth = (projects) => {
    const healthPriority = {
      critical: 4,
      blocked: 3,
      "at-risk": 2,
      healthy: 1,
    };
    const worstHealth = projects?.reduce((worst, project) => {
      return healthPriority[project?.sprintHealth] > healthPriority[worst]
        ? project.sprintHealth
        : worst;
    }, "healthy");
    return worstHealth;
  };

  const getProgressBarColor = (health) => {
    switch (health) {
      case "healthy":
        return "bg-green-500";
      case "at-risk":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      case "blocked":
        return "bg-purple-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="flex-1 mx-auto rounded-md">
      <div className="mb-8">
        <p className="text-gray-600">
          Managing {teams?.length ?? 0} teams with{" "}
          {teams?.reduce(
            (sum, team) => sum + (team.projects?.length ?? 0),
            0
          ) ?? 0}{" "}
          active projects
        </p>
      </div>

      <div className="space-y-4">
        <CreateProjectDialog
          selectedTeam={selectedTeam}
          onClose={() => setSelectedTeam(null)}
        />
        {teams.map((team) => {
          const isExpanded = expandedTeams.has(team.id);
          const overallHealth = getOverallTeamHealth(team.projects);

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

                  <div className="flex items-center space-x-4">
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

                      {(team.projects?.length ?? 0) !== 0 && (
                        <div className="text-sm font-medium text-gray-900">
                          {team.projects?.length ?? 0} project
                          {team.projects?.length ?? 0 !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50">
                  <div className="p-4 space-y-3">
                    {!team.projects && (
                      <div className="flex items-center justify-center mb-2">
                        <h3 className="font-medium text-gray-900">
                          No projects
                        </h3>
                      </div>
                    )}
                    {team.projects?.map((project) => (
                      <div
                        key={project.id}
                        className="bg-white p-3 rounded-md border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">
                            {project.name}
                          </h3>
                          <div
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getHealthColor(
                              project.sprintHealth
                            )}`}
                          >
                            {getHealthIcon(project.sprintHealth)}
                            <span className="capitalize">
                              {project.sprintHealth.replace("-", " ")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(
                                project.sprintHealth
                              )}`}
                              style={{ width: `${project.completion}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600 min-w-12">
                            {project.completion}%
                          </span>
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

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Health Status Legend
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-700">Healthy</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-700">At Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-700">Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-700">Blocked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsList;
