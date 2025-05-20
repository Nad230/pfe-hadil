// components/shared/add-member-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const AddMemberDialog = ({
  open,
  onOpenChange,
  searchQuery,
  setSearchQuery,
  errorMessage,
  searchedUser,
  onSearch,
  onAddMember
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  errorMessage: string
  searchedUser: any
  onSearch: () => void
  onAddMember: () => void
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Team Member</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by full name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={onSearch}>Search</Button>
        </div>
        {errorMessage && (
          <div className="text-red-500 text-sm">{errorMessage}</div>
        )}
        {searchedUser && (
          <div className="p-2 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{searchedUser.fullname}</p>
                <p className="text-sm text-gray-500">{searchedUser.email}</p>
              </div>
              <Button size="sm" onClick={onAddMember}>
                Add
              </Button>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  </Dialog>
)