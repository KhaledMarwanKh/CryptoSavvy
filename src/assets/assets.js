import {
    FaCircle,
    FaDrawPolygon,
    FaArrowRight,
    FaHighlighter,
    FaFont,
    FaComment
} from 'react-icons/fa';

import {
    BsTriangle,
    BsArrowUpRight,
    BsCursor,
} from 'react-icons/bs';

import {
    TbChartCandle,
    TbLine,
    TbLineHeight,
    TbArrowBarToRight
} from 'react-icons/tb';

import {
    MdHorizontalRule,
    MdCallToAction
} from 'react-icons/md';

import {
    RiRulerLine
} from 'react-icons/ri';

import {
    LuRectangleHorizontal,
    LuTrendingUp,
    LuCross,
    LuBrush
} from 'react-icons/lu';

import { BiEraser } from 'react-icons/bi';

import {
    BiTrendingUp,
    BiVerticalCenter
} from 'react-icons/bi';

import {
    AiOutlineStock
} from 'react-icons/ai';
import { toast } from 'react-toastify';

export const drawingTools = [
    {
        name: "Circle",
        description: "Draw a circle to highlight key price zones or areas of interest on the chart",
        icon: FaCircle
    },
    {
        name: "Triangle",
        description: "Draw a triangle pattern to identify chart patterns like ascending, descending, or symmetrical triangles",
        icon: BsTriangle
    },
    {
        name: "Path",
        description: "Draw a custom freeform path connecting multiple points on the chart",
        icon: FaDrawPolygon
    },
    {
        name: "ParallelChannel",
        description: "Draw two parallel trendlines to identify price channels and potential support/resistance zones",
        icon: TbLineHeight
    },
    {
        name: "FibRetracement",
        description: "Draw Fibonacci retracement levels to identify potential support and resistance levels based on key ratios",
        icon: AiOutlineStock
    },
    {
        name: "PriceRange",
        description: "Measure the price difference between two points to calculate price movement and percentage change",
        icon: RiRulerLine
    },
    {
        name: "LongShortPosition",
        description: "Calculate and visualize potential profit/loss for long or short trade positions",
        icon: BiTrendingUp
    },
    {
        name: "Text",
        description: "Add text annotations and notes directly on the chart for documentation",
        icon: FaFont
    },
    {
        name: "MarketDepth",
        description: "Visualize market depth and order book data to analyze buying and selling pressure",
        icon: TbChartCandle
    },
    {
        name: "Rectangle",
        description: "Draw a rectangle to highlight consolidation zones, support/resistance areas, or price ranges",
        icon: LuRectangleHorizontal
    },
    {
        name: "TrendLine",
        description: "Draw a straight line connecting two points to identify trend direction and potential breakouts",
        icon: LuTrendingUp
    },
    {
        name: "Ray",
        description: "Draw a line that extends infinitely in one direction from a starting point",
        icon: TbArrowBarToRight
    },
    {
        name: "Arrow",
        description: "Draw an arrow to point at specific price levels or chart formations",
        icon: FaArrowRight
    },
    {
        name: "ExtendedLine",
        description: "Draw a line that extends infinitely in both directions through two points",
        icon: TbLine
    },
    {
        name: "HorizontalLine",
        description: "Draw a horizontal line at a specific price level to mark support or resistance",
        icon: MdHorizontalRule
    },
    {
        name: "HorizontalRay",
        description: "Draw a horizontal line that extends infinitely to the right from a starting point",
        icon: BsArrowUpRight
    },
    {
        name: "VerticalLine",
        description: "Draw a vertical line at a specific time to mark important dates or events",
        icon: BiVerticalCenter
    },
    {
        name: "CrossLine",
        description: "Draw intersecting horizontal and vertical lines to pinpoint exact price and time coordinates",
        icon: LuCross
    },
    {
        name: "Callout",
        description: "Add a callout box with text and pointer to annotate specific chart areas",
        icon: FaComment
    },
    {
        name: "Brush",
        description: "Freehand drawing tool to sketch custom shapes and markings on the chart",
        icon: LuBrush
    },
    {
        name: "Highlighter",
        description: "Highlight areas on the chart with a semi-transparent marker for emphasis",
        icon: FaHighlighter
    },
    {
        name: "Cursor",
        description: "move on chart without drawing",
        icon: BsCursor
    },
    {
        name: "Eraser",
        description: "clear all",
        icon: BiEraser
    }
];

export const handleDownloadChartImage = (chartContainerRef) => {
    if (chartContainerRef.current) {

        try {

            const elements = chartContainerRef.current.querySelectorAll("*");

            let canvas = elements[6];

            const dataUrl = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = dataUrl;
            link.setAttributeNode(document.createAttribute('download'))
            link.click();

            toast.success("Download will starting soon");

        } catch (error) {
            toast.error("Something got wrong!\n Try Again", {
                className: 'font-bold'
            })

            console.log(error)
        }

    }
}
