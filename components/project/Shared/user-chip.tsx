import { cn } from "@/lib/utils"

export const UserChip = ({ 
  user,
  selected,
  onSelect
}: {
  user: any
  selected: boolean
  onSelect: (userId: string) => void
}) => (
  <div
    className={cn(
      "flex items-center rounded-full px-4 py-2 cursor-pointer transition-colors",
      selected
        ? "bg-blue-100 border-2 border-blue-500 text-blue-800"
        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
    )}
    onClick={() => onSelect(user.id)}
  >
    {user.profile_photo ? (
      <img
        src={user.profile_photo}
        className="h-6 w-6 rounded-full mr-2"
        alt={user.fullname}
      />
    ) : (
      <div className="h-6 w-6 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
        {user.fullname?.[0]}
      </div>
    )}
    <span className="text-sm font-medium">{user.fullname}</span>
  </div>
)
