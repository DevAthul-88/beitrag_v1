import MainLayout from '@/app/layouts/MainLayout'
import RepositoryList from '@/components/repositories/RepositoryList'
import React from 'react'

export const metadata = {
  title: 'Repositories ',
  description: 'View all your GitHub repositories in one place',
}

function page() {
  return (
    <MainLayout>
      <RepositoryList />
    </MainLayout>
  )
}

export default page