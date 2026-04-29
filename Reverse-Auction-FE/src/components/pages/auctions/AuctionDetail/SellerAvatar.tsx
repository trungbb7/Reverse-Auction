export default function SellerAvatar({
  name,
  size = 40,
}: {
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-rose-100 text-rose-700",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
}
