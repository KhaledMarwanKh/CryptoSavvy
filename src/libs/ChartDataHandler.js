import axios from "axios";

const apiURL = import.meta.env.VITE_API_URL + "/api/crypto"

class ChartDataHandler {
    constructor() {
        this.interval = null;
        this.symbol = null;
        this.mode = null;
        this.isChartDataArrived = false;
    }

    setSymbol(symbol) {
        this.symbol = symbol;
    }

    setInterval(interval) {
        this.interval = interval;
    }

    setMode(mode) {
        this.mode = mode;
    }

    async getChartData() {
        try {
            this.isChartDataArrived = false;

            const candles = (await axios.get(apiURL + `/history?symbol=${this.symbol}&interval=${this.interval}`)).data;

            this.isChartDataArrived = true;

            console.log(candles)

            return { candles };

        } catch (error) {
            console.log(error);
        }
    }
}

const chartHandler = new ChartDataHandler();

export default chartHandler;