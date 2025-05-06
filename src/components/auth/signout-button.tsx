'use client'
 
import { signOut } from "next-auth/react"
import { Button } from "@mui/material"
 
export default function SignOutButton() {
  return (
    <Button variant="outlined" onClick={() => signOut()}>
      Sign Out
    </Button>
  )
}