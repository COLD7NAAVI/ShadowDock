function info(...args) {
  console.log(
    "🟢",
    ...args
  );
}

function warn(...args) {
  console.warn(
    "🟡",
    ...args
  );
}

function error(...args) {
  console.error(
    "🔴",
    ...args
  );
}

export default {
  info,
  warn,
  error,
};