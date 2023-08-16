import debug from 'debug';

// Create a function that returns a logger based on the provided namespace
export function createLogger(namespace: string) {
  const logger = debug(namespace);

  // Enable debugging based on environment
  if (process.env.NODE_ENV !== 'production') {
    logger.enabled = true;
  }

  // Create wrapper functions for different log levels
  return {
    log: logger,
    info: logger.extend(':info'),
    warn: logger.extend(':warn'),
    error: logger.extend(':error'),
    debug: logger.extend(':debug')
  };
}
