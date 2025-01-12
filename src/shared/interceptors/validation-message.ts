import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class ValidationMessageInterceptor implements NestInterceptor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err.response?.message)
          err.response.message = this.cleanValidationMessages(
            err.response.message,
          );
        throw err;
      }),
    );
  }

  private cleanValidationMessages(messages: string[]): string[] {
    if (Array.isArray(messages))
      return messages.map((message) => message.replace(/^.*?\./, ""));
    return messages;
  }
}
