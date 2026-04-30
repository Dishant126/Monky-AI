import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import { getUserFromRequest } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { name, bio, avatar } = await request.json()

    const updates: Record<string, string> = {}

    if (typeof name === 'string') {
      updates.name = name.trim()
    }

    if (typeof bio === 'string') {
      updates.bio = bio.trim()
    }

    if (typeof avatar === 'string') {
      updates.avatar = avatar
    }

    await dbConnect()

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password')

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: (updatedUser as any)._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        createdAt: updatedUser.createdAt,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}