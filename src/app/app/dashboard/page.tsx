import MainLayout from '@/app/layouts/MainLayout'
import Dashboard from '@/components/dashboard/Dashboard'
import React from 'react'

function page() {
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  )
}

export default page