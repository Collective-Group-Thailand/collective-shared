/**
 * The integrations log through whatever logger the product gives them (NestJS `Logger`, pino…), never `console` by
 * default in production. Adapters never log request or response bodies (PII, secrets).
 */
export interface IntegrationsLogger {
  log(message: string): void;
  warn(message: string): void;
  error(message: string, trace?: string): void;
}

let current: IntegrationsLogger = {
  log: () => undefined,
  warn: (message) => console.warn(`[integrations] ${message}`),
  error: (message, trace) => console.error(`[integrations] ${message}`, trace ?? ''),
};

/** Called once at boot by the product, e.g. `setIntegrationsLogger(new Logger('Integrations'))`. */
export function setIntegrationsLogger(logger: IntegrationsLogger): void {
  current = logger;
}

export function integrationsLogger(): IntegrationsLogger {
  return current;
}
