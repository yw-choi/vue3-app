import { User } from "@/auth/models/user";

export const API_BASE_URL = "http://localhost:8081";

// Api server response code
export const STATUS_CODE = {
  SUCCESS: 0,
  GENERIC_FAILURE: 1,
  DB_FAILURE: 2,
  INVALID_INPUT: 3,
  UNAUTHORIZED_ACCESS: 4,

  AUTH_USER_NOT_FOUND: 100,
  AUTH_INVALID_PASSWORD: 101,
  AUTH_REGISTER_VALIDATION_FAILURE: 102,
  AUTH_DUPLICATE_EMAIL: 103,

  IMAGE_NOT_FOUND: 200,
  IMAGE_INVALID_FILETYPE: 201
};

export class ServerError extends Error {
  status: Number;

  constructor(message, status: Number) {
    super(message);
    this.name = "ServerError";
    this.status = status;
  }
}

export function getHeader() {
  const user = User.buildFromLocalStorage();

  if (user.accessToken) {
    return { "x-access-token": user.accessToken };
  } else {
    return {};
  }
}
