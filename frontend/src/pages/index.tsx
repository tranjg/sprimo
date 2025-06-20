import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Link } from "react-router-dom"

const Hero = () => {
    return(
      <div className="flex flex-col w-full h-full place-items-center">
        <div className="flex-1 p-2 place-items-center border-1 w-full">
            <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                  <NavigationMenuLink>
                    <Link to={"/home"}>Home</Link>
                  </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex flex-col border-1 rounded-md justify-center w-1/2 p-4 mt-5">
          <h1 className="font-bold">
            Track Sprint Health. Unblock your team.
          </h1>
          <p className="mt-2">
          A unified dashboard that helps Agile teams monitor progress, detect blockers early, and stay aligned—across GitHub, Jira, and Slack.
          </p>
        </div>
      </div>
    )
}

export default Hero