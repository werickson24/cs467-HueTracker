import Link from 'next/link'
import Image from 'next/image'
import { auth } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { Container, Box, Typography, Button, Stack } from '@mui/material'

export default async function Home() {
  // Check authentication
  const session = await auth()

  // If user is logged in, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <Box
      display="flex"
      minHeight="100vh"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={2}
    >
      <Container maxWidth="sm">
        <Stack spacing={4}>
          <Box textAlign="center">
            <Image
              src="/HueTracker_Logo_grey.png"
              alt="Logo"
              width={800}
              height={200}
              style={{ margin: 'auto' }}
            />
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              Track and manage your 3D printing filaments
            </Typography>
          </Box>

          <Stack spacing={2}>
            <Link href="/api/auth/signin" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
              >
                Sign In
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}




/*
export default async function Home() {
  const session = await auth();

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <Box
      display="flex"
      minHeight="100vh"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={2}
    >
      <Container maxWidth="sm">
        <Stack spacing={4}>
          <Box textAlign="center">
            <Image
              src="/HueTracker_Logo_grey.png"
              alt="Logo"
              width={800}
              height={200}
              style={{ margin: 'auto' }}
            />
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              Track and manage your 3D printing filaments
            </Typography>
          </Box>

          <Stack spacing={2}>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
              >
                Sign In
              </Button>
            </Link>

          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}*/