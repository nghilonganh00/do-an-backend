export class UserRole {
  id: string;
  role: string;
}
export class User {
  id: string;
  email: string;
  password: string;
  userRoles: UserRole[];
}
