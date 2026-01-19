import MainLayout from '@/app/layouts/MainLayout'
import React from 'react'
import { Metadata } from 'next'
import SettingsPage from '@/components/settings/SettingsPage'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account settings, security preferences, and connected services in one place.',
}

export default function Page() {
  return (
    <MainLayout>
      <SettingsPage />
    </MainLayout>
  )
}
