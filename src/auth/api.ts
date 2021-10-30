import axios from "axios";
import { getHeader, API_BASE_URL, ServerError, STATUS_CODE } from "@/common/api.config";
import { User } from "@/auth/models/user";

const API_URL = API_BASE_URL + "/auth/";

export async function login(user: User): Promise<User> {
  const response = await axios.post(API_URL + "login", {
    email: user.email,
    password: user.password
  });

  if (response.data.status == STATUS_CODE.SUCCESS) {
    const userdata = response.data.user;
    return User.buildFromServerResponse(userdata);
  } else {
    throw new ServerError(API_URL + "login", response.data.status);
  }
}
