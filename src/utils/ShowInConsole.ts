/**
 * Logs debug information only during development.
 *
 * @param message - Description of the log message.
 * @param value - Optional data to log.
 */
const ShowInConsole = (message: string, value?: unknown): void => {
  // __DEV__ is true in development and false in production builds.
  // Prevents debug logs from being printed in production.
  if (!__DEV__) return;

  // Create an Error to capture the current JavaScript stack trace.
  const stack = new Error().stack;

  // Extract the stack trace line that usually identifies the caller.
  // Index 0: Error message
  // Index 1: ShowInConsole function
  // Index 2: Function that called ShowInConsole
  const callerLine = stack?.split("\n")[2]?.trim();

  // Print the message, additional data, and caller information.
  console.log({
    message,
    value: value !== undefined ? value : null,
    // Remove the leading "at " prefix when present in the stack trace.
    caller: callerLine ? callerLine.replace(/^at\s+/, "") : undefined,
  });
};

export default ShowInConsole;
