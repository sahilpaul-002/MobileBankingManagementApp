/**
 * Logs debug information only during development.
 *
 * @param message - Description of the log message.
 * @param value - Optional object containing additional data to log.
 */
const ShowInConsole = (message: string, value: object | null = null): void => {
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
    value,
    // Remove the leading "at " prefix when present in the stack trace.
    caller: callerLine?.replace(/^at\s+/, ""),
  });
};

export default ShowInConsole;
