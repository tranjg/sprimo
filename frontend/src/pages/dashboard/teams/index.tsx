import TeamsList from "./components/TeamsList"
import Layout from "./layout"

const Teams = () => {
    return(
        <Layout>
        <div className="flex-1 p-2">
            {/* <div className="flex flex-col gap-2 p-4 border-1 rounded-md">
                <h1 className="font-bold text-xl">Sprimo</h1>
                <p>This is the description of the team</p>
            </div> */}
            <TeamsList />
        </div>
        </Layout>
    )
}

export default Teams