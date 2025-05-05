import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface ExtendedSession {
  user?: ExtendedUser;
}

export async function GET() {
  const session = await getServerSession(authOptions) as ExtendedSession;
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const filaments = await prisma.filament.findMany({
    where: {
      userId: session.user.id
    }
  });

  return NextResponse.json(filaments);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions) as ExtendedSession;
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  const filament = await prisma.filament.create({
    data: {
      ...data,
      userId: session.user.id
    }
  });

  return NextResponse.json(filament);
}