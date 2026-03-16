import { io } from "socket.io-client";
class SocketHandler {
    constructor() {
        if (!SocketHandler.instance) {
            this.socket = io(import.meta.env.VITE_API_URL
                , {
                    autoConnect: false,
                    transports: ["websocket"],
                    reconnection: true,
                });

            this.currentMode = null;
            this.socketData = null;
            this.currentPage = 1;
            this.currentPageSize = null;

            SocketHandler.instance = this;
        }

        return SocketHandler.instance;
    }

    connect() {
        if (!this.socket.connected) {
            this.socket.connect();
        }
    }

    disconnect() {
        if (this.socket.connected) {
            this.socket.disconnect();
        }
    }

    getSocketData() {
        return this.socketData;
    }

    setSocketData(newData) {
        this.socketData = newData;
    }

    setPage(page, payload = { mode: "dashboard", pageSize: 8 }) {
        if (this.currentPage === page) return;

        this.removeAllListeners();

        this.currentPage = page;

        this.socket.emit("setMode", { page, ...payload });
    }

    setMode(mode, payload = { page: 1, pageSize: 8 }) {
        if (this.currentMode === mode) return;

        this.removeAllListeners();

        this.currentMode = mode;

        this.socket.emit("setMode", { mode, ...payload });
    }

    on(event, callback) {
        this.socket.on(event, callback);
    }

    off(event, callback) {
        this.socket.off(event, callback);
    }

    removeAllListeners() {
        this.socket.removeAllListeners();
    }
}

const socket = new SocketHandler();

export default socket;