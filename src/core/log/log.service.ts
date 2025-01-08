import { Global, Injectable, Logger, Scope } from "@nestjs/common";

import { Module } from "@nestjs/common";

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends Logger {
  protected context?: string;

  error(message: any, trace?: string) {
    super.error(message, trace, this.context);
  }

  warn(message: any) {
    super.warn(message, this.context);
  }

  log(message: any) {
    super.log(message, this.context);
  }

  debug(message: any) {
    super.debug(message, this.context);
  }

  verbose(message: any) {
    super.verbose(message, this.context);
  }

  setContext(context: string) {
    this.context = context;
  }
}

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
