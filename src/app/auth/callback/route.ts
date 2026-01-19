import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/app/dashboard'

  // Handle OAuth errors from GitHub
  if (error || errorCode || errorDescription) {
    const params = new URLSearchParams()
    if (error) params.set('error', error)
    if (errorCode) params.set('error_code', errorCode)
    if (errorDescription) params.set('error_description', errorDescription)
    
    return NextResponse.redirect(`${origin}/login?${params.toString()}`)
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError)
        return NextResponse.redirect(
          `${origin}/login?error=auth_failed&error_description=${encodeURIComponent(exchangeError.message)}`
        )
      }

      // IMPORTANT: Capture and store the provider token
      if (data.session?.provider_token) {
        const { error: upsertError } = await supabase
          .from('user_tokens')
          .upsert({
            user_id: data.session.user.id,
            github_token: data.session.provider_token,
            github_username: data.session.user.user_metadata?.user_name,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          })

        if (upsertError) {
          console.error('Failed to store GitHub token:', upsertError)
          // Don't fail the login, but log the error
        } else {
          console.log('GitHub token stored successfully for user:', data.session.user.id)
        }
      } else {
        console.warn('No provider_token found in session')
      }
      
      // Success - redirect to dashboard
      return NextResponse.redirect(`${origin}${next}`)
    } catch (err) {
      console.error('Unexpected auth error:', err)
      return NextResponse.redirect(
        `${origin}/login?error=auth_failed&error_description=${encodeURIComponent('An unexpected error occurred')}`
      )
    }
  }

  // No code provided
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}