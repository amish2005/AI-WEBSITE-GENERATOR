"use client"

import React, { useContext } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { OnSaveContext } from '@/context/OnSaveContext'
import { useTheme } from '@/context/ThemeContext'

function PlaygroundHeader({ replaceMode, setReplaceMode }: { replaceMode: boolean; setReplaceMode: (v: boolean) => void }) {
  const {onSaveData, setOnSaveData} = useContext(OnSaveContext);
  const { theme } = useTheme();
  return (
    <div className='flex justify-between items-center p-4 shadow'>
      <div className='flex items-center gap-4'>
        <Image className={theme === 'dark' ? 'invert filter' : ''} src="/logo.svg" alt="Logo" width={40} height={40} />
        <div className='flex items-center gap-2'>
          <Button variant={replaceMode ? 'ghost' : 'secondary'} onClick={() => setReplaceMode(false)}>Append</Button>
          <Button variant={replaceMode ? 'secondary' : 'ghost'} onClick={() => setReplaceMode(true)}>Replace</Button>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <Button onClick={() => setOnSaveData(Date.now())}>Save</Button>
      </div>
    </div>
  )
}

export default PlaygroundHeader
