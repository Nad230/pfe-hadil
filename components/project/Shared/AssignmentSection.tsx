import { Plus } from "lucide-react"
import { UserChip } from "./user-chip"

export const AssignmentSection = ({
  teamMembers,
  selectedAssignee,
  onSelect,
  onAddMember
}: {
  teamMembers: any[]
  selectedAssignee: string | null
  onSelect: (userId: string) => void
  onAddMember: () => void
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium">Assign To</label>
    <div className="flex flex-wrap gap-2">
      {teamMembers.map((member) => (
        <UserChip
          key={member.id}
          user={member}
          selected={selectedAssignee === member.id}
          onSelect={onSelect}
        />
      ))}
      <button
        onClick={onAddMember}
        className="flex items-center bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600"
      >
        <Plus className="h-4 w-4 mr-1" /> Add Member
      </button>
    </div>
  </div>
)