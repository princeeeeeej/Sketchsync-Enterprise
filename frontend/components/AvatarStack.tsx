interface User {
  id: string;
  name: string;
}

const avatarColors = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", 
  "bg-rose-500", "bg-amber-500", "bg-cyan-500"
];

const getInitials = (name: string) => {
  if (!name) return "U";
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
};

const getColor = (id: string) => {
  if (!id) return avatarColors[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

export const AvatarStack = ({ users, currentUserId }: { users: User[], currentUserId: string }) => {
  const uniqueUsers = Array.from(
    new Map(users.filter(u => u && u.id).map((u) => [u.id, u])).values()
  );

  if (uniqueUsers.length === 0) return null;

  return (
    <div className="absolute top-6 right-6 flex items-center z-50">
      <div className="flex items-center -space-x-2">
        {uniqueUsers.map((user, idx) => (
          <div 
            key={`${user.id}-${idx}`} 
            className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white text-[11px] font-bold text-white shadow-md group cursor-default ${getColor(user.id)}`}
          >
            {getInitials(user.name || "User")}

            <div className="absolute top-10 whitespace-nowrap bg-stone-900 text-white text-[10px] font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
              {user.id === currentUserId ? `${user.name || "User"} (You)` : user.name || "User"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};