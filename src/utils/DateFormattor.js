const INTERVALS = {
  "1m": { type: "minute", size: 1, format: "minute" },
  "5m": { type: "minute", size: 5, format: "minute" },
  "15m": { type: "minute", size: 15, format: "minute" },
  "1h": { type: "hour", size: 1, format: "hour" },
  "4h": { type: "hour", size: 4, format: "hour" },
  "7d": { type: "day", size: 7, format: "day" },
  "1M": { type: "month", size: 1, format: "month" },
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function toUtcParts(timeMs) {
  const date = new Date(timeMs);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
  };
}

function formatUtcDate({ year, month, day }) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function formatUtcDateTime({ year, month, day, hour, minute }) {
  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}`;
}

function floorTimeToInterval(timeMs, interval) {
  const config = INTERVALS[interval];

  if (!config) {
    throw new Error(`Unsupported interval: ${interval}`);
  }

  const date = new Date(timeMs);

  if (config.type === "minute") {
    const minute = Math.floor(date.getUTCMinutes() / config.size) * config.size;
    date.setUTCMinutes(minute, 0, 0);
    return date.getTime();
  }

  if (config.type === "hour") {
    const hour = Math.floor(date.getUTCHours() / config.size) * config.size;
    date.setUTCHours(hour, 0, 0, 0);
    return date.getTime();
  }

  if (config.type === "day") {
    const utcDayStart = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    );
    const intervalMs = config.size * 24 * 60 * 60 * 1000;
    return Math.floor(utcDayStart / intervalMs) * intervalMs;
  }

  if (config.type === "month") {
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0);
  }

  throw new Error(`Unhandled interval type: ${config.type}`);
}

function formatTimeByInterval(timeMs, interval) {
  const bucketTimeMs = floorTimeToInterval(timeMs, interval);
  const parts = toUtcParts(bucketTimeMs);
  const config = INTERVALS[interval];

  if (config.format === "minute" || config.format === "hour") {
    return formatUtcDateTime(parts);
  }

  if (config.format === "day") {
    return formatUtcDate(parts);
  }

  if (config.format === "month") {
    return `${parts.year}-${pad(parts.month)}`;
  }

  throw new Error(`Unhandled format type: ${config.format}`);
}

export { formatTimeByInterval, floorTimeToInterval };
