import MainLayout from '@/app/layouts/MainLayout'
import LanguageBreakdown from '@/components/languages/LanguageBreakdown'
import React from 'react'

export const metadata = {
  title: 'Languages ',
  description: 'See a breakdown of programming languages used across your GitHub repositories',
}


function page() {
  return (
    <MainLayout>
     <LanguageBreakdown />
    </MainLayout>
  )
} 

export default page   