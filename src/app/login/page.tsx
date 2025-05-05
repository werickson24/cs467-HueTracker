"use client"

import { useSession } from "next-auth/react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  CircularProgress,
  Paper
} from "@mui/material"

export default function Login() {
  const { status } = useSession()
  const router = useRouter()

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [status, router])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="sm">
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
        py={4}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Sign In
          </Typography>

          {status === "authenticated" ? (
            <div>
              <Typography variant="body1" gutterBottom>
                Add another passkey to your account
              </Typography>
              <Button 
                variant="contained" 
                fullWidth
                size="large"
                onClick={() => signIn("passkey", { action: "register" })}
              >
                Register new Passkey
              </Button>
            </div>
          ) : (
            <div>
              <Typography variant="body1" gutterBottom>
                Sign in with your passkey
              </Typography>
              <Button 
                variant="contained" 
                fullWidth
                size="large"
                onClick={() => signIn("passkey", { callbackUrl: "/dashboard" })}
              >
                Sign in with Passkey
              </Button>
            </div>
          )}
        </Paper>
      </Box>
    </Container>
  )
}