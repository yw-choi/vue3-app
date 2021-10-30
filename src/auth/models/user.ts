export class User {
  id: string = "";
  email: string = "";
  accessToken: string = "";

  // these fields are for the login form purpose. not stored in local storage.
  password: string = ""; // for the login form only
  passwordConfirm: string = ""; // for the login form only

  private static readonly USER_KEY = "user";

  saveToLocalStorage(): void {
    localStorage.setItem(User.USER_KEY, JSON.stringify(this.toJson()));
  }

  isLoggedIn(): boolean {
    return this.accessToken ? true : false;
  }

  /**
   * Converts User object to simple json object.
   */
  toJson(): object {
    return {
      id: this.id,
      email: this.email,
      accessToken: this.accessToken
    };
  }
  /**
   * Build user object from server response
   * @param userdata user data object from login success response
   */
  static buildFromServerResponse(userdata: object): User {
    const user = new User();
    user.id = userdata["id"];
    user.email = userdata["email"];
    user.accessToken = userdata["accessToken"];
    return user;
  }

  /**
   * Build user object from local storage. If not found, return an empty User object
   */
  static buildFromLocalStorage(): User {
    const userdata = localStorage.getItem(User.USER_KEY);
    if (userdata) {
      const json = JSON.parse(userdata);
      const user = new User();
      user.id = json["id"];
      user.email = json["email"];
      user.accessToken = json["accessToken"];
      return user;
    } else {
      return new User();
    }
  }

  static removeFromLocalStorage(): void {
    localStorage.removeItem(User.USER_KEY);
  }
}
