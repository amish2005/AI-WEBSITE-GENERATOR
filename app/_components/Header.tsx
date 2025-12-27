"use client"

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight} from 'lucide-react'
import { SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

const MenuOptions = [{name:'Pricing', path:'/pricing'}, {name:'Contact Us', path:'/contact-us'}]

function Header() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className='flex items-center justify-between p-4 shadow'>
      {/* Logo */}
      <div className='flex gap-2 items-center'>
        <Image className={theme === 'dark' ? 'invert filter' : ''} src={'/logo.svg'} alt='logo' width={35} height={35} />
        <h2 className="font-bold text-xl">AI Website Generator</h2>
      </div>

      {/* menu options */}
      <div className='flex gap-3'>
        {MenuOptions.map((menu, index) => (
            <Button variant={'ghost'} key={index}>{menu.name}</Button>
        ))}
      </div>

      {/* get started button */}
      <div className='flex items-center gap-2'>
        <Button variant={'ghost'} onClick={toggleTheme} aria-label='Toggle theme'>
          {theme === 'dark' ? <Sun className='w-4 h-4' /> : <Moon className='w-4 h-4' />}
        </Button>
        <SignInButton mode='modal' forceRedirectUrl={'/workspace'}>
        <Link href={'/workspace'}>
          <Button>Get Started <ArrowRight /></Button>
        </Link>
        </SignInButton>
      </div>

    </div>
  )
}

export default Header
