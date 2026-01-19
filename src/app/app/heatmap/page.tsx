import MainLayout from '@/app/layouts/MainLayout'
import ActivityHeatmapPage from '@/components/heatmap/ActivityHeatmapPage'
import React from 'react'

export const metadata = {
  title: 'Activity Heatmap ',
  description: 'Visualize your GitHub commit activity with an interactive contribution heatmap',
}

function page() {
  return (
    <MainLayout>
      <ActivityHeatmapPage />
    </MainLayout>
  )
} 

export default page 