export interface JwtPayload {
  sub: string; // User ID
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    roles: string[];
  };
}
