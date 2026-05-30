import HttpAppError from "./app.error";

export class BadRequestException extends HttpAppError {
  constructor(message = "Invalid input / missing required data") {
    super(message, 400, "BadRequest");
  }
}

export class UnauthorizedException extends HttpAppError {
  constructor(message = "No token OR invalid token") {
    super(message, 401, "Unauthorized");
  }
}

export class ForbiddenException extends HttpAppError {
  constructor(message = "Authenticated but no permission") {
    super(message, 403, "Forbidden");
  }
}

export class NotFoundException extends HttpAppError {
  constructor(message = "Resource doesn’t exist") {
    super(message, 404, "NotFound");
  }
}

export class ConflictException extends HttpAppError {
  constructor(message = "Resource doesn’t exist") {
    super(message, 409, "Conflict");
  }
}

export class TooManyRequestsException extends HttpAppError {
  constructor(message = "Too Many Requests") {
    super(message, 429, "Too_Many_Requests");
  }
}
