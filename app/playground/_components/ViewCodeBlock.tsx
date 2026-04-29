import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

function ViewCodeBlock({children, code}: any) {
    const handleCopy = async () => {
        await navigator.clipboard.writeText(code || '');
        toast.success('Code Copied!');
    }

  return (
    <Dialog>
  <DialogTrigger asChild>{children}</DialogTrigger>
  <DialogContent className='max-w-5xl w-[90vw] max-h-[85vh] flex flex-col p-6'>
    <DialogHeader className="flex-shrink-0">
      <DialogTitle className="flex justify-between items-end pb-2">
        <span className="text-2xl font-bold leading-none">Source Code</span>
        <Button variant="secondary" onClick={handleCopy} className="gap-2 shadow-sm mt-1">
           <Copy className="w-4 h-4" /> Copy Code
        </Button>
      </DialogTitle>
    </DialogHeader>
    <DialogDescription asChild>
      <div className='flex-1 min-h-0 overflow-auto w-full mt-4 rounded-xl bg-[#1E1E1E] border border-border shadow-inner'>
          <SyntaxHighlighter 
              language="html"
              style={vs2015}
              wrapLongLines={true}
              customStyle={{
                  backgroundColor: 'transparent',
                  padding: '1.5rem',
                  margin: 0,
                  fontSize: '14px',
              }}
          >
              {code}
          </SyntaxHighlighter>
      </div>
    </DialogDescription>
  </DialogContent>
</Dialog>
  )
}

export default ViewCodeBlock
