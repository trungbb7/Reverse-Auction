export function getHomeByRole(role?: string): string {
  switch (role) {
    case "ROLE_SELLER":
      return "/seller/search";
    case "ROLE_ADMIN":
      return "/admin";
    default:
      return "/";
  }
}
