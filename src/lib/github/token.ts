'use client'

import { createClient } from '@/lib/supabase/client'

/**
 * GitHub token data structure
 */
export interface GitHubTokenData {
  token: string
  username: string
  userId: string
}

/**
 * Get GitHub token (Client-side only)
 * Use this in Client Components, hooks, and browser contexts
 * 
 * Usage:
 * const tokenData = await getGitHubToken()
 * if (!tokenData) return // handle no token
 * const { token, username } = tokenData
 */
export async function getGitHubToken(): Promise<GitHubTokenData | null> {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('No authenticated user found:', userError?.message)
      return null
    }

    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('github_token, github_username')
      .eq('user_id', user.id)
      .single()

    if (tokenError) {
      console.error('Failed to fetch GitHub token:', tokenError.message)
      return null
    }

    if (!tokenData?.github_token) {
      console.error('No GitHub token found for user')
      return null
    }

    return {
      token: tokenData.github_token,
      username: tokenData.github_username || user.user_metadata?.user_name || '',
      userId: user.id
    }
  } catch (error) {
    console.error('Error fetching GitHub token:', error)
    return null
  }
}

/**
 * Validate if a GitHub token is still valid by making a test API call
 */
export async function validateGitHubToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    })
    
    return response.ok
  } catch (error) {
    console.error('Error validating GitHub token:', error)
    return false
  }
}
