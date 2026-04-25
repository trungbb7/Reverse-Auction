import type { JwtPayload } from "jwt-decode";
import type { Role } from "./role";

export interface MyJwtPayload extends JwtPayload {
  role: Role;
  fullName: string;
}
