import MainLayout from '@/app/layouts/MainLayout'
import PullRequestMetrics from '@/components/pull-requests/PullRequestMetrics'
import React from 'react'

export const metadata = {
  title: 'Pull Requests ',
  description: 'Track and analyze your GitHub pull request activity across repositories',
}

function page() {
  return (
    <MainLayout>
       <PullRequestMetrics />
    </MainLayout>
  )
} 

export default page 