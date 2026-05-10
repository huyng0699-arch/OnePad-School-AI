import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessage = this.resolveErrorMessage(exception);

    response.status(status).json({
      ok: false,
      error: errorMessage,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolveErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      if (typeof payload === "string") return payload;
      if (payload && typeof payload === "object") {
        const message = (payload as { message?: string | string[] }).message;
        if (Array.isArray(message)) return message.join("; ");
        if (typeof message === "string") return message;
      }
      return exception.message || "request_failed";
    }
    if (exception instanceof Error) return exception.message;
    return "internal_server_error";
  }
}
