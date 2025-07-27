import CreateTeamDialog from "../components/CreateTeamDialog";
import TeamsList from "./components/TeamsList";

const Teams = () => {
  return (
    <div className="flex-1 p-5">
      <div className="flex p-4 mb-3 w-full border-1 rounded-md justify-end bg-sidebar">
        <CreateTeamDialog />
      </div>
      <TeamsList />
    </div>
  );
};

export default Teams;
