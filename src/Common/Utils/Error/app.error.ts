class HttpAppError extends Error {
  constructor(
    message: string = "Somthing Went Wrong",
    public status: number = 500,
    public type: string = "Internal Server Error",
    public details?: any ,
    options?: ErrorOptions ,
  ) {
    super(message, options);
    this.name = this.constructor.name
  }
}

export default HttpAppError;
