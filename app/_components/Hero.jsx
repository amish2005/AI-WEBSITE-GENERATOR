"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUp, HomeIcon, ImagePlus, Key, LayoutDashboard, Loader2Icon, User } from 'lucide-react'
import { SignInButton, useUser } from '@clerk/nextjs'
import { ro } from 'date-fns/locale'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { set } from 'date-fns'
import {v4 as uuidv4} from 'uuid'
import axios from 'axios'


const suggestions = [
  {
    label: 'Dashboard',
    prompt: 'Create an analytics dashboard to track customers and revenue data for a SaaS',
    icon: LayoutDashboard
  },
  {
    label: 'SignUp Form',
    prompt: 'Create a modern sign up form with email/password fields, Google and Github login options, and terms checkbox',
    icon: Key
  },
  {
    label: 'Hero',
    prompt: 'Create a modern header and centered hero section for a productivity SaaS. Include a badge for feature announcement, a title with a subtle gradient effect, subtitle, CTA, small social proof and an image.',
    icon: HomeIcon
  },
  {
    label: 'User Profile Card',
    prompt: 'Create a modern user profile card component for a social media website',
    icon: User
  }
]

const generateRandomFrameNumber = () => {
  const num = Math.floor(Math.random() * 10000);
  return num;
}

function Hero() {
    const [userInput, setUserInput] = useState();
    const user = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const createNewProject = async () =>{
      setLoading(true);
      const projectId = uuidv4();
      const frameId = generateRandomFrameNumber();
      const message = [
        {role: 'user', content: userInput }
      ]
      try{
        // console.log(frameId)
        const result = await axios.post('api/projects', {
          projectId: projectId,
          frameId: frameId,
          messages: message

        });

        console.log("Project Inserted: " + result.data);
        toast.success('Project created successfully!');

        // Navigate to the playground
        router.push(`/playground/${projectId}?frameId=${frameId}`);
        setLoading(false);
      } catch (e) {
        toast.error('Internal Server Error. Please try again later.');
        console.log(e)
      }

    }

    


  return (
    <div className='flex flex-col items-center h-[80vh] justify-center'>
      {/* Header & description */}
      <h2 className='font-bold text-6xl'>What should we Design?</h2>
      <p className='mt-2 text-xl text-gray-500'>Generate, Edit and Explore design with AI, Export code as well</p>

      {/* input box */}

      <div className='w-full max-w-2xl p-5 border mt-5 rounded-2xl'>
        <textarea value={userInput} onChange={(event) => setUserInput(event.target.value)} placeholder='Describe your page design' className='w-full h-24 focus:outline-none focus:ring-0 resize-none'/>
        <div className='flex justify-between items-center'>
            <Button variant={'ghost'}><ImagePlus /></Button>
            {!user ? <SignInButton mode='modal' forceRedirectUrl={'/workspace'}>
              <Button disabled={!userInput || loading}><ArrowUp /></Button>
            </SignInButton> :
            <Button onClick={createNewProject} disabled={!userInput}>
              {loading?<Loader2Icon className='animate-spin'/>:<ArrowUp />}</Button>
  }
        </div>
      </div>
      

      {/* suggestion list */}
      <div className='mt-4 flex gap-3'>
        {suggestions.map((suggestion, index) => (
            <Button onClick={() => setUserInput(suggestion.prompt)} key={index} variant={'outline'}>
                <suggestion.icon />
                {suggestion.label}
            </Button>
        ))}
      </div>

    </div>
  )
}

export default Hero
