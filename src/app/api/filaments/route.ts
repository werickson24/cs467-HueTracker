import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const filaments = await prisma.filament.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(filaments)
  } catch (error) {
    console.error('Error fetching filaments:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const data = await request.json()
    const filament = await prisma.filament.create({
      data: {
        ...data,
        userId: session.user.id
      }
    })

    return NextResponse.json(filament)
  } catch (error) {
    console.error('Error creating filament:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}