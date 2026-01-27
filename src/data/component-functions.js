import toast from "react-hot-toast";
import {
    FibChannelDrawingTool,
    FibSpiralDrawingTool,
    FibWedgeDrawingTool,
    RectangleDrawingTool,
    TimeLineDrawingTool,
    TriangleDrawingTool,
    TrendLineDrawingTool,
    CurveDrawingTool,
    PolylineDrawingTool,
} from 'interactive-lw-charts-tools'

export const getFilteredData = (searchTerm, sortConfig, crypto, filterConfig) => {
    let sortableData = [...crypto];

    if (searchTerm !== '') {
        const lowerCaseSearch = searchTerm.toLowerCase();
        sortableData = sortableData.filter(crypto =>
            crypto.symbol.toLowerCase().includes(lowerCaseSearch) ||
            crypto.baseSymbol.toLowerCase().includes(lowerCaseSearch)
        );
    }

    if (sortConfig.key) {
        sortableData.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    if (filterConfig.marketCap.min !== Number.POSITIVE_INFINITY) {
        console.log(1)
        sortableData = sortableData.filter(crypto => crypto.marketCap >= filterConfig.marketCap.min);
    }

    if (filterConfig.marketCap.max !== Number.NEGATIVE_INFINITY) {
        sortableData = sortableData.filter(crypto => crypto.marketCap <= filterConfig.marketCap.max);
    }

    if (filterConfig.volume.min !== Number.POSITIVE_INFINITY) {
        sortableData = sortableData.filter(crypto => crypto.volume >= filterConfig.volume.min);
    }

    if (filterConfig.volume.max !== Number.NEGATIVE_INFINITY) {
        sortableData = sortableData.filter(crypto => crypto.volume <= filterConfig.volume.max);
    }

    if (filterConfig.price.min !== Number.POSITIVE_INFINITY) {
        sortableData = sortableData.filter(crypto => crypto.price >= filterConfig.price.min);
    }

    if (filterConfig.price.max !== Number.NEGATIVE_INFINITY) {
        sortableData = sortableData.filter(crypto => crypto.price <= filterConfig.price.max);
    }

    return sortableData;

}

export const handleDownloadChartImage = async (editorState, chartContainerRef) => {
    if (chartContainerRef.current) {

        try {

            const elements = chartContainerRef.current.querySelectorAll("*");

            let canvas;

            if (editorState) {
                const canvas1 = document.getElementById('canvas');
                const canvas2 = elements[6];

                const width = Math.max(canvas1.width, canvas2.width);
                const height = Math.max(canvas1.height, canvas2.height);

                // Create a new canvas
                const mergedCanvas = document.createElement('canvas');
                mergedCanvas.width = width;
                mergedCanvas.height = height;
                const ctx = mergedCanvas.getContext('2d');

                // Draw the first canvas
                ctx.drawImage(canvas2, 0, 0);

                // Draw the second canvas on top
                ctx.drawImage(canvas1, 0, 0);

                canvas = mergedCanvas;
            } else {
                canvas = elements[6];
            }

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


export const makeTool = (toolNum, chart, series, editorState, setCursorMode, toolRef, setSelectedTool) => {

    if (editorState) {
        setCursorMode('hand');
    }

    if (toolNum === 10 && toolRef.current) {
        toolRef.current.remove();
        setSelectedTool(9);
        return toolRef.current;
    }

    let tool = toolRef.current;

    switch (toolNum) {
        case 0:
            tool = new TrendLineDrawingTool(chart, series);
            break;
        case 1:
            tool = new TimeLineDrawingTool(chart, series);
            break;
        case 2:
            tool = new TriangleDrawingTool(chart, series);
            break;
        case 3:
            tool = new RectangleDrawingTool(chart, series, {
                fillColor: 'blue'
            });
            break;
        case 4:
            tool = new FibChannelDrawingTool(chart, series);
            break;
        case 5:
            tool = new FibSpiralDrawingTool(chart, series);
            break
        case 6:
            tool = new FibWedgeDrawingTool(chart, series);
            break;
        case 7:
            tool = new CurveDrawingTool(chart, series);
            break;
        case 8:
            tool = new PolylineDrawingTool(chart, series);
            break;
    }

    return tool;
}