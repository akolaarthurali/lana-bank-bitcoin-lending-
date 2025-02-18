"use client"

import React from "react"
import { gql } from "@apollo/client"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@lana/web/ui/dialog"

import { Button } from "@lana/web/ui/button"

import { useCommitteeRemoveUserMutation } from "@/lib/graphql/generated"

gql`
  mutation CommitteeRemoveUser($input: CommitteeRemoveUserInput!) {
    committeeRemoveUser(input: $input) {
      committee {
        ...CommitteeFields
      }
    }
  }
`

type RemoveUserCommitteeDialogProps = {
  committeeId: string
  userId: string
  userEmail: string
  openRemoveUserDialog: boolean
  setOpenRemoveUserDialog: (isOpen: boolean) => void
}

export const RemoveUserCommitteeDialog: React.FC<RemoveUserCommitteeDialogProps> = ({
  committeeId,
  userId,
  userEmail,
  openRemoveUserDialog,
  setOpenRemoveUserDialog,
}) => {
  const [removeUser, { loading }] = useCommitteeRemoveUserMutation()

  const handleRemove = async () => {
    try {
      const { data } = await removeUser({
        variables: {
          input: {
            committeeId,
            userId,
          },
        },
      })
      if (data?.committeeRemoveUser.committee) {
        toast.success("User removed from committee successfully")
        setOpenRemoveUserDialog(false)
      }
    } catch (error) {
      console.error("Error removing user from committee:", error)
      toast.error("Failed to remove user from committee")
    }
  }

  return (
    <Dialog open={openRemoveUserDialog} onOpenChange={setOpenRemoveUserDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Committee Member</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to remove <span className="font-bold">{userEmail}</span>{" "}
          from this committee?
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpenRemoveUserDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleRemove} loading={loading}>
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
