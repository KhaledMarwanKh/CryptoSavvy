import { GoHomeFill } from "react-icons/go";
import { IoNewspaper } from "react-icons/io5";
import { FaBrain, FaUser } from "react-icons/fa6";
import { FaRobot } from "react-icons/fa";

const navigationRoutes = [
    {
        path: '/',
        name: 'Dashboard',
        iconName: GoHomeFill,
        usage: 'The primary overview of market data.'
    },
    {
        path: '/ai-chat',
        name: 'AI Chat',
        iconName: FaRobot,
        usage: 'Interactive AI assistant for queries.'
    },
    {
        path: '/ai-analysis',
        name: 'AI Analysis',
        iconName: FaBrain,
        usage: 'AI-driven market predictions and reports.'
    },
    {
        path: '/News',
        name: 'Market News',
        iconName: IoNewspaper,
        usage: 'Latest cryptocurrency and market news.'
    },
];

export default navigationRoutes;