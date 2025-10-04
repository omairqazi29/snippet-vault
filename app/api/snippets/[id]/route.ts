import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!snippet) {
      return NextResponse.json(
        { error: 'Snippet not found' },
        { status: 404 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!snippet.isPublic && snippet.userId !== session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(snippet)
  } catch (error) {
    console.error('Error fetching snippet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch snippet' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const snippet = await prisma.snippet.findUnique({
      where: { id: params.id }
    })

    if (!snippet) {
      return NextResponse.json(
        { error: 'Snippet not found' },
        { status: 404 }
      )
    }

    if (snippet.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { title, description, code, language, isPublic, tags } = await request.json()

    const updatedSnippet = await prisma.snippet.update({
      where: { id: params.id },
      data: {
        title,
        description,
        code,
        language,
        isPublic,
        tags
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedSnippet)
  } catch (error) {
    console.error('Error updating snippet:', error)
    return NextResponse.json(
      { error: 'Failed to update snippet' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const snippet = await prisma.snippet.findUnique({
      where: { id: params.id }
    })

    if (!snippet) {
      return NextResponse.json(
        { error: 'Snippet not found' },
        { status: 404 }
      )
    }

    if (snippet.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await prisma.snippet.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Snippet deleted' })
  } catch (error) {
    console.error('Error deleting snippet:', error)
    return NextResponse.json(
      { error: 'Failed to delete snippet' },
      { status: 500 }
    )
  }
}
