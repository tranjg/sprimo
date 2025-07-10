import { drizzle } from "drizzle-orm/node-postgres"
import { eq, getTableColumns } from "drizzle-orm"
import { projects, team_members, teams } from "../drizzle/schema.ts"

const db = drizzle(process.env.DATABASE_URL as string)

export const addTeam = async (req, res) => {
    try {
    const values = req.body;

    const newTeam = await db
    .insert(teams)
    .values(values)
    .returning({id: teams.id, created_by: teams.created_by});
    
    await db
    .insert(team_members)
    .values({
        user_id: newTeam[0].created_by, 
        team_id: newTeam[0].id,
        role: "owner",
    })

    return res.status(201).json({message: "Successfully added a new team", success: true})
    } catch(error) {
        console.error("Error adding a new team")

        return res
        .status(500)
        .json({message: "There was an error adding a team", success: false})
    }
}

export const getTeams = async (req, res) => {
    try {
        const userId = req.query.userId;

        const memberCount = db.$count(team_members, eq(team_members.team_id, teams.id))

        const teamsApartOf = await db
        .select({...getTableColumns(teams), memberCount, projects: getTableColumns(projects)})
        .from(teams)
        .innerJoin(team_members, eq(team_members.team_id, teams.id))
        .leftJoin(projects, eq(projects.team_id, teams.id))
        .where(eq(team_members.user_id, userId))
        .groupBy(teams.id, projects.id)
   
        return res.json(teamsApartOf)
    } catch (error) {
        console.error("Error fetching teams")

        return res
        .status(500)
        .json({message: "There was an error getting teams", success: false})
    }
}