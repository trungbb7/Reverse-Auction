import type { User } from "@/types/user";
import api from "@/utils/axios";

export const fetchUser = async () => {
  const res = await api.get("/users/me");
  const user = res.data as User;
  return user;
};
