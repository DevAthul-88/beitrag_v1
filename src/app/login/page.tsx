import LoginPage from '@/components/auth/LoginPage'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Track and analyze commits across all your GitHub repositories with detailed insights, charts, and top repository statistics.',
}


function page() {
  return (
    <div><LoginPage /></div>
  )
}

export default page