import { io } from "socket.io-client";
import { baseURL } from "./initAxios";
import toast from "react-hot-toast";

const initialChartData = {
    index: 0,
    baseSymbol: "",
    price: 0,
    symbol: "",
    high24h: 0,
    low24h: 0,
    marketCap: 0,
    volume: 0,
    changePercent: 0.00,
}

class SocketHandler {
    constructor(mode, page = 1, pageSize = 8) {
        this.mode = mode;
        this.pageSize = pageSize;
        this.page = page;
        this.socket = io(baseURL);
        this.isChartDataArrived = false;
        this.socketData = null;
    }

    setMode(mode) {
        this.mode = mode;
        this.initSocket();
    }

    setPageSize(pageSize) {
        this.pageSize = pageSize;
        if (this.mode === "dashboard") {
            this.initSocket()
        }
    }

    setPage(page) {
        this.page = page;
        if (this.mode === "dashboard") {
            this.initSocket()
        }
    }

    getPage() {
        return this.page;
    }

    getPageSize() {
        return this.pageSize;
    }

    getMode() {
        return this.mode;
    }

    initSocket() {

        this.socket.emit('setMode', {
            mode: this.mode,
            pageSize: this.pageSize,
            page: this.page
        });

    }

    registerSocketEvents(setInitialData) {
        this.socket.on("connect", () => {
            toast("Informaion Will appeared soon", {
                duration: 1000,
            })
            if (this.mode === "chart") {
                setInitialData(initialChartData);
            } else {
                setInitialData([]);
            }
            console.log("connected");
        })

        this.socket.on("disconnect", (reason) => {
            if (reason === "io client disconnect") {
                toast.error("Your Connection is Bad");
            } else if (reason === "io server disconnect") {
                toast.error("Server Disconnected");
            } else {
                console.log(reason);
            }
            this.socket.connect()
        })
    }

    registerSocketDashboardDataEvent(setIsLoading, setCrypto) {
        this.socket.on("cryptoData", (data) => {
            console.log("hello from dashboard")
            if (!data) {
                console.log(data);
                return;
            }

            const newData = Object.values(data).map(value => value.meta);

            const newDataLength = newData.length;

            console.log(newDataLength)

            if (newDataLength === this.pageSize) {
                this.socketData = newData;
            }

            if (newDataLength < this.pageSize) {
                if (this.socketData.length === this.pageSize) {
                    setCrypto(this.socketData);
                } else {
                    setCrypto([])
                }
            } else {
                setCrypto(newData);
            }

            setIsLoading(false);

        })
    }

    registerSocketChartDataEvent(coinId, setCryptoData, setOrderBookData, setIsLoading) {
        this.socket.on("cryptoData", (data) => {
            console.log("Hello From Chart");
            if (!data) {
                this.socketData = initialChartData;
                return
            }

            const { meta, orderBook } = Object.values(data)[0];

            setCryptoData(meta);

            setOrderBookData(orderBook);

            setIsLoading(false);

            this.isChartDataArrived = true;
        })
    }
}

const socketHandler = new SocketHandler("dashboard", 1, 8);

export default socketHandler;