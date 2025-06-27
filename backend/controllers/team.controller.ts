import { drizzle } from "drizzle-orm/node-postgres"
import { teams } from "../drizzle/schema"

const db = drizzle(process.env.DATABASE_URL as string)

export const addTeam = async (req, res) => {
    try {
    const values = req.body

    await db
    .insert(teams)
    .values(values)

    return res.status(201).json({message: "Successfully added a new team", success: true})
    } catch(error) {
        console.error("Error adding a new team")

        return res
        .status(500)
        .json({message: "There was an error adding a team", success: false})
    }
}