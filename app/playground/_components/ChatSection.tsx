"use client"

import React, { useState } from 'react'
import { Messages } from '../[projectId]/page'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'

type Props = {
  messages: Messages[],
  onSend: any,
  loading: boolean
}

function ChatSection({messages, onSend, loading}:Props) {
  const [input, setInput] = useState<string>();
  const handleSend = () => {
    if(!input?.trim()) return;
    onSend(input);
    setInput('');
  }
  return (
    <div className='w-96 shadow h-[90vh] p-4 flex flex-col bg-popover text-popover-foreground border border-border rounded-lg'>
      {/* Message Section */}
      <div className='flex-1 overflow-y-auto p-4 space-y-3 flex flex-col'>
        {messages?.length===0?
        (
          <p className='text-muted-foreground text-center'>No Messages Yet</p>

        ):(
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role==='user'?'justify-end':'justify-start'}`}>
              <div className={`p-2 rounded-lg max-w-[80%] ${msg.role==='user'?"bg-muted text-muted-foreground shadow-sm": "bg-card text-card-foreground"}`}>
                {msg.content}
              </div>
            </div>
          ))
        )    
        }

        {loading && <div className='flex justify-center items-center p-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-muted'></div>
          <span className='ml-2 text-muted-foreground'>Thinking...</span>
        </div>}
      </div>

      <div className='p-3 border-t border-border flex items-center gap-2'>
        <textarea 
          value={input}
          className='flex-1 resize-none rounded-lg px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring/50'
          placeholder='Describe your website design idea'
          onChange={(event) => setInput(event.target.value)}
        />
        <Button onClick={handleSend}> <ArrowUp /></Button>
      </div>
      
    </div>
  )
}

export default ChatSection
