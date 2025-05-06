// app/register/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/webauthn";
import Link from "next/link";
import MuiLink from "@mui/material/Link";

import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";

export default function Register() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Optional: state for displaying potential errors

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    setError(null); // Clear previous errors

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      // Initiate the passkey registration flow
      // action: "register" tells next-auth to start the WebAuthn registration ceremony
      // email: is sent to the adapter to associate the new passkey with this user/email
      // callbackUrl: is where the user will be redirected *after* successful registration
      //              and potential automatic login. Redirecting to dashboard is common,
      //              or you could redirect to login page if manual login is required after register.
      const res = await signIn("passkey", {
        email,
        action: "register",
        callbackUrl: "/dashboard", // Or your desired post-registration page
        redirect: false // We handle redirect manually or let the callbackUrl handle it
      });

      setIsLoading(false);

      // The `signIn` function for webauthn doesn't block until the passkey is created
      // in the browser prompt. It initiates the process. The actual success/failure
      // and potential redirect happen via the browser's interaction with your /api/auth callbacks.
      // You might want more sophisticated error handling here based on the `res` object
      // if `redirect: false` is used. `res.error` might contain information if the initial
      // signIn call failed (e.g., invalid options), but WebAuthn *protocol* errors
      // during the browser prompt are typically handled server-side and result in a
      // redirect with an error query parameter (e.g., /?error=...).

      // For this basic example, we rely on callbackUrl or manual redirect later.
      if (res?.url) {
        // If res.url is present, next-auth wants to redirect.
        // This often happens after the browser prompt completes successfully
        // and the user is potentially logged in.
        // You might use useRouter().push(res.url) here if redirect: false
        // and you want client-side navigation.
        // However, since callbackUrl is set, next-auth usually handles the final redirect
        // server-side after the callback API route finishes.
        console.log("Passkey registration process initiated. Checking for redirect...", res.url);
        // No need for explicit client-side redirect here if callbackUrl is set and works.
      } else if (res?.error) {
         // Handle errors returned by the signIn function itself
         console.error("Sign-in (registration) error:", res.error);
         setError(res.error);
      } else {
        // This case might occur if redirect: false and no url/error is returned immediately.
        // The browser prompt is now active.
        console.log("Passkey registration prompt should be visible.");
        // You might add UI feedback here indicating the user should interact with the browser prompt.
      }

    } catch (err) {
      console.error("An unexpected error occurred during registration:", err);
      setIsLoading(false);
      setError("An unexpected error occurred."); // Display a generic error
    }
  };

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
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
          component="form" // Use Paper as a form wrapper
          onSubmit={handleRegister} // Attach the submit handler
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Register
          </Typography>

          {error && (
             <Typography color="error" align="center">
               {error}
             </Typography>
          )}

          <TextField
            label="Email Address"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            type="submit" // Make the button a submit button
            disabled={isLoading || !email} // Disable if loading or email is empty
          >
            {isLoading ? <CircularProgress size={24} /> : "Register with Passkey"}
          </Button>

          {/* Link back to Login Page */}
          <Typography variant="body2" align="center">
            Already have an account?{" "}
            <Link href="/login" passHref legacyBehavior>
              <MuiLink component="a" underline="hover">
                Sign In
              </MuiLink>
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}