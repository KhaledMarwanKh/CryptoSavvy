import { BarChart3, BotIcon, CircuitBoard, Contact2, DollarSign, LogOut, Newspaper } from "lucide-react"
import { GoQuestion } from "react-icons/go";

const navigationRoutes = [
    {
        name: "Dashboard",
        route: "/",
        icon: CircuitBoard
    },
    {
        name: "News",
        route: "/news",
        icon: Newspaper
    },
    {
        name: "AI Chat",
        route: "/ai/chat",
        icon: BotIcon
    },
    {
        name: "AI Analyze",
        route: "/ai/analyze",
        icon: BarChart3
    },
    {
        name: "Currency Market",
        route: "/currency-market",
        icon: DollarSign
    },
    {
        name: "About",
        route: "/about",
        icon: GoQuestion
    },
    {
        name: "Contact Us",
        route: "/contact",
        icon: Contact2
    },
    {
        name: "Logout",
        route: "/auth/login",
        icon: LogOut
    },
]

export default navigationRoutes;