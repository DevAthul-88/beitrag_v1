import MainLayout from '@/app/layouts/MainLayout'
import DORAMetrics from '@/components/dora-metrics/DORAMetrics'
import ActivityHeatmapPage from '@/components/heatmap/ActivityHeatmapPage'
import React from 'react'

export const metadata = {
  title: 'DORA Metrics ',
  description: 'Track and analyze your software delivery performance with DORA metrics, including deployment frequency, lead time, change failure rate, and more.',
}

function page() {
  return (
    <MainLayout>
       <DORAMetrics />
    </MainLayout>
  )
} 

export default page 