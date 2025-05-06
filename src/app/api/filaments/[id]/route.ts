import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma/client"

const prisma = new PrismaClient()

export async function DELETE(
  request: Request,
  context:  { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } = await context.params

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const filament = await prisma.filament.findUnique({
      where: {
        id,
      },
    })

    if (!filament || filament.userId !== session.user.id) {
      return new NextResponse("Not Found", { status: 404 })
    }

    await prisma.filament.delete({
      where: {
        id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting filament:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } =  await context.params

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const data = await request.json()
    
    const existingFilament = await prisma.filament.findUnique({
      where: {
        id,
      },
    })

    if (!existingFilament || existingFilament.userId !== session.user.id) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const filament = await prisma.filament.update({
      where: {
        id,
      },
      data: {
        ...data,
        userId: session.user.id,
      },
    })

    return NextResponse.json(filament)
  } catch (error) {
    console.error('Error updating filament:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}