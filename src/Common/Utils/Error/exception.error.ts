import HttpAppError from "./app.error";

export class BadRequestException extends HttpAppError {
  constructor(message = "Invalid input / missing required data", details?: any) {
    super(message, 400, "BadRequest", details);
  }
}

export class UnauthorizedException extends HttpAppError {
  constructor(message = "No token OR invalid token", details?: any) {
    super(message, 401, "Unauthorized", details);
  }
}

export class ForbiddenException extends HttpAppError {
  constructor(message = "Authenticated but no permission", details?: any) {
    super(message, 403, "Forbidden", details);
  }
}

export class NotFoundException extends HttpAppError {
  constructor(message = "Resource doesn’t exist", details?: any) {
    super(message, 404, "NotFound", details);
  }
}

export class ConflictException extends HttpAppError {
  constructor(message = "Resource doesn’t exist", details?: any) {
    super(message, 409, "Conflict", details);
  }
}

export class TooManyRequestsException extends HttpAppError {
  constructor(message = "Too Many Requests", details?: any) {
    super(message, 429, "Too_Many_Requests", details);
  }
}
