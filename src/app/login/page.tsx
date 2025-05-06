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

export default function Login() {
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

            <div>
              <Button 
                variant="contained" 
                fullWidth
                size="large"
                onClick={() => signIn("passkey", { callbackUrl: "/dashboard" })}
              >
                Sign in with Passkey
              </Button>
            </div>
            <div className="flex space-evenly">
              <Typography variant="body2" align="center">
              Don't have an account? {" "}
              
              <Button
                variant="outlined"
                href="/register"
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