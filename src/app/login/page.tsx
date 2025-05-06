"use client"

import { signIn } from "next-auth/webauthn"
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  CircularProgress,
  Paper,
} from "@mui/material"
import { useState } from "react"

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const res = await signIn("passkey", {
        callbackUrl: "/dashboard",
        redirect: false
      })

      if (res?.url) {
        // The authentication was successful, handle redirect
        window.location.href = res.url
      } else if (res?.error) {
        setError(res.error)
      }
    } catch (err) {
      console.error("An unexpected error occurred during sign in:", err)
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
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

          {error && (
            <Typography color="error" align="center">
              {error}
            </Typography>
          )}

          <div>
            <Button 
              variant="contained" 
              fullWidth
              size="large"
              onClick={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Sign in with Passkey"}
            </Button>
          </div>
          <div className="flex space-evenly">
            <Typography variant="body2" align="center">
              {"Don't have an account?  "}
              <Button
                variant="outlined"
                href="/register"
                disabled={isLoading}
              >
                Sign Up
              </Button>
            </Typography>
          </div>
        </Paper>
      </Box>
    </Container>
  )
}