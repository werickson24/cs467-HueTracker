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

    const updateData: {
      name?: string
      materialType?: string
      brand?: string
      color?: string
      weightRemaining?: number
      spoolWeight?: number
      notes?: string | null
    } = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.materialType !== undefined) updateData.materialType = data.materialType
    if (data.brand !== undefined) updateData.brand = data.brand
    if (data.color !== undefined) updateData.color = data.color
    if (data.weightRemaining !== undefined) updateData.weightRemaining = data.weightRemaining
    if (data.spoolWeight !== undefined) updateData.spoolWeight = data.spoolWeight
    if (data.notes !== undefined) updateData.notes = data.notes

    const filament = await prisma.filament.update({
      where: {
        id,
      },
      data: updateData,
    })
    return NextResponse.json(filament)
  } catch (error) {
    console.error('Error updating filament:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}