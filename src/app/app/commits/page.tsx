import MainLayout from '@/app/layouts/MainLayout'
import CommitsTracking from '@/components/commits/CommitsTracking'
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Commits Tracking ',
  description: 'Track and analyze commits across all your GitHub repositories with detailed insights, charts, and top repository statistics.',
}

export default function Page() {
  return (
    <MainLayout>
       <CommitsTracking />
    </MainLayout>
  )
}
