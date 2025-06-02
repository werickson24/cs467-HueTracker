'use client';

import Image from 'next/image';
import { AppBar, Toolbar } from '@mui/material';
import SignOutButton from '@/components/auth/signout-button';

export default function DashboardHeader() {
  return (
    <AppBar position="static" color="default" elevation={4}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Image
          src="/HueTracker_Logo_transparent.svg"
          alt="Logo"
          width={150}
          height={100}
          style={{ marginTop: '16px', marginBottom: '16px' }}
        />
        <SignOutButton />
      </Toolbar>
    </AppBar>
  );
}