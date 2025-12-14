// =====================
// server.js
// =====================

const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

// =====================
// Local Imports
// =====================
const { startCryptoSocket } = require('./middlewares/cryptoSocket');
const appError = require('./utils/appError');
const globalError = require('./controllers/errorController');

const userRoute = require('./routes/userRoute');
const cryptoHistoryRoute = require('./routes/cryptoRoute');
const newsRoute = require('./routes/newsRoute');

// =====================
// Environment
// =====================
dotenv.config({ path: './.env' });

const app = express();
const port = process.env.PORT || 4000;

// =====================
// CORS Setup
// =====================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (!allowedOrigins.includes(origin)) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }

      return callback(null, true);
    },
    credentials: true,
  })
);

app.options('*', cors({ origin: allowedOrigins, credentials: true }));
app.use('/uploads', express.static('uploads'));

// =====================
// Global Middlewares
// =====================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(helmet());

app.use(
  '/api',
  rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000,
    message:
      'Too many requests from this IP, please try again later.',
  })
);

app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist: [] }));

// =====================
// Routes
// =====================
app.get('/', (req, res) => {
  res.send('API IS RUNNING');
});

app.use('/api/user', userRoute);
app.use('/api/crypto', cryptoHistoryRoute);
app.use('/api/news', newsRoute);

// =====================
// Unhandled Routes
// =====================
app.all('*', (req, res, next) => {
  next(
    new appError(
      `can't find ${req.originalUrl} on this server!`,
      404
    )
  );
});

app.use(globalError);

// =====================
// HTTP + Socket.IO
// =====================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// =====================
// Socket Subscriptions Store
// =====================
// userSubscriptions[socket.id] = {
//   mode: 'dashboard' | 'chart',
//   symbols: ['BTCUSDT', 'ETHUSDT']
// }
const userSubscriptions = {};

// =====================
// Socket.IO Events
// =====================
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  // Ensure default entry
  userSubscriptions[socket.id] =
    userSubscriptions[socket.id] || {
      mode: 'dashboard',
      symbols: [],
    };

  // -------- setMode --------
  socket.on('setMode', (mode) => {
    if (!userSubscriptions[socket.id]) {
      userSubscriptions[socket.id] = {
        mode: 'dashboard',
        symbols: [],
      };
    }

    userSubscriptions[socket.id].mode =
      typeof mode === 'string' && mode === 'chart'
        ? 'chart'
        : 'dashboard';

    console.log(
      `⚙️ ${socket.id} mode set to: ${userSubscriptions[socket.id].mode}`
    );
  });

  // -------- subscribe --------
  // accepts string or array of strings
  socket.on('subscribe', (payload) => {
    if (!userSubscriptions[socket.id]) {
      userSubscriptions[socket.id] = {
        mode: 'chart',
        symbols: [],
      };
    }

    const arr = Array.isArray(payload) ? payload : [payload];

    for (let s of arr) {
      if (typeof s !== 'string') {
        if (s && typeof s === 'object' && s.symbol) {
          s = String(s.symbol);
        } else {
          continue;
        }
      }

      const sym = s.trim().toUpperCase();

      if (!userSubscriptions[socket.id].symbols.includes(sym)) {
        userSubscriptions[socket.id].symbols.push(sym);
        console.log(`📈 ${socket.id} subscribed to ${sym}`);
      }
    }

    // Enforce chart mode
    userSubscriptions[socket.id].mode = 'chart';
  });

  // -------- unsubscribe --------
  socket.on('unsubscribe', (payload) => {
    if (!userSubscriptions[socket.id]) return;

    const arr = Array.isArray(payload) ? payload : [payload];

    for (let s of arr) {
      if (typeof s !== 'string') {
        if (s && typeof s === 'object' && s.symbol) {
          s = String(s.symbol);
        } else {
          continue;
        }
      }

      const sym = s.trim().toUpperCase();

      userSubscriptions[socket.id].symbols =
        userSubscriptions[socket.id].symbols.filter(
          (x) => x !== sym
        );

      console.log(`📉 ${socket.id} unsubscribed from ${sym}`);
    }
  });

  // -------- disconnect --------
  socket.on('disconnect', () => {
    delete userSubscriptions[socket.id];
    console.log('🔴 Client disconnected:', socket.id);
  });

  // -------- health ping --------
  socket.on('pingServer', () => {
    socket.emit('pongServer', { time: Date.now() });
  });
});

// =====================
// Crypto Socket Starter
// =====================
startCryptoSocket(io, userSubscriptions);

// =====================
// Run Server
// =====================
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
