import type { JwtPayload } from "jwt-decode";
import type { Role } from "./role";

export interface MyJwtPayload extends JwtPayload {
  id: string;
  role: Role;
  fullName: string;
}
