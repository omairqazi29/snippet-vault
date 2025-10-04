import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const language = searchParams.get('language')
    const tag = searchParams.get('tag')
    const publicOnly = searchParams.get('public')

    const session = await getServerSession(authOptions)

    const where: any = {}

    if (publicOnly === 'true') {
      where.isPublic = true
    } else if (session?.user?.id) {
      where.OR = [
        { userId: session.user.id },
        { isPublic: true }
      ]
    } else {
      where.isPublic = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (language) {
      where.language = language
    }

    if (tag) {
      where.tags = { has: tag }
    }

    const snippets = await prisma.snippet.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(snippets)
  } catch (error) {
    console.error('Error fetching snippets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch snippets' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, description, code, language, isPublic, tags } = await request.json()

    if (!title || !code || !language) {
      return NextResponse.json(
        { error: 'Title, code, and language are required' },
        { status: 400 }
      )
    }

    const snippet = await prisma.snippet.create({
      data: {
        title,
        description,
        code,
        language,
        isPublic: isPublic || false,
        tags: tags || [],
        userId: session.user.id
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

    return NextResponse.json(snippet, { status: 201 })
  } catch (error) {
    console.error('Error creating snippet:', error)
    return NextResponse.json(
      { error: 'Failed to create snippet' },
      { status: 500 }
    )
  }
}
