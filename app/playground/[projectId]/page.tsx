"use client"
import React, { use, useEffect, useState } from 'react'
import PlaygroundHeader from '../_components/PlaygroundHeader'
import ChatSection from '../_components/ChatSection'
import WebsiteDesign from '../_components/WebsiteDesign'
import ElementSettingSection from '../_components/ElementSettingSection'
import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'

export type Frame = {
  projectId: string,
  frameId: string,
  designCode: string,
  chatMessages: Messages[]
}
export type Messages = {
  role: string,
  content: string
}

const Prompt = `
userInput: {userInput}

Instructions:

1. If the user input is explicitly asking to generate code, design, or HTML/CSS/JS output (e.g., "Create a landing page", "Build a dashboard", "Generate HTML Tailwind CSS code"), then:

   - Generate a complete HTML Tailwind CSS code using Flowbite UI components.  
   - Use a modern design with **blue as the primary color theme**.  
   - Only include the <body> content (do not add <head>, or <title>).  
   - Make it fully responsive for all screen sizes.  
   - All primary components must match the theme color.  
   - Add proper padding and margin for each element.  
   - Components should be independent; do not connect them.  
   - For all images, use the Unsplash proxy: '/api/unsplash?query=[keyword]' where [keyword] describes the image you want (e.g., '/api/unsplash?query=office').
   - Ensure the image 'src' uses this exact format.
   - Add an alt tag describing the image.  
   - Use the following libraries/components where appropriate:  
       - FontAwesome icons (fa fa-)  
       - Flowbite UI components: buttons, modals, forms, tables, tabs, alerts, cards, dialogs, dropdowns, accordions, etc.  
       - Chart.js for charts & graphs  
       - Swiper.js for sliders/carousels  
       - Tippy.js for tooltips & popovers  
   - Include interactive components like modals, dropdowns, and accordions.  
   - Ensure proper spacing, alignment, hierarchy, and theme consistency.  
   - Ensure charts are visually appealing and match the theme color.  
   - Header menu options should be spread out and not connected.  
   - Do not include broken links.  
   - Do not add any extra text before or after the HTML code.  

2. If the user input is **general text or greetings** (e.g., "Hi", "Hello", "How are you?") **or does not explicitly ask to generate code**, then:

   - Respond with a simple, friendly text message instead of generating any code.  

Example:

- User: "Hi" → Response: "Hello! How can I help you today?"  
- User: "Build a responsive landing page with Tailwind CSS" → Response: [Generate full HTML code as per instructions above]

`



function PlayGround() {
  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get('frameId');
  const [frameDetails, setFrameDetails] = useState<Frame>();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [generatedCode, setGeneratedCode] = useState<any>();

  useEffect(() => {
    frameId && getFrameDetails();
  }, [frameId])

  const getFrameDetails = async () => {
    const result = await axios.get('/api/frames?frameId=' + frameId + '&projectId=' + projectId);
    // console.log("Result Final")
    console.log(result?.data)
    setFrameDetails(result.data);
    const designCode = result.data?.designCode;
    let formattedCode = '';
    if (!designCode) {
      formattedCode = '';
    } else if (designCode.includes('```html')) {
      const start = designCode.indexOf('```html') + 7;
      const end = designCode.indexOf('```', start);
      formattedCode = end > start ? designCode.slice(start, end) : designCode.slice(start);
    } else if (/\<body[\s\S]*?>[\s\S]*?<\/body>/i.test(designCode)) {
      const m = designCode.match(/\<body[\s\S]*?>([\s\S]*?)<\/body>/i);
      formattedCode = m ? m[1] : designCode;
    } else {
      // fallback: use full designCode
      formattedCode = designCode;
    }

    setGeneratedCode(formattedCode);
    if (result.data?.chatMessages?.length == 1) {
      const userMsg = result.data?.chatMessages[0].content;
      SendMessage(userMsg);
    } else {
      setMessages(result.data?.chatMessages || []);
    }
  }

  const SendMessage = async (userInput: string) => {
    setLoading(true);

    // add user message locally so UI updates immediately
    const localMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(localMessages);

    // Code will be replaced when the stream starts emitting code chunks

    // Build payload: choose system instruction depending on whether we have existing generated code
    const payloadMessages: any[] = [];
    if (generatedCode) {
      const code = typeof generatedCode === 'string' ? generatedCode.replace(/^```+\w*\n?/, '') : '';
      const editSystem = `You are an expert assistant that edits HTML/CSS based on user requests.

Here is the current HTML code of the design:
\`\`\`html
${code}
\`\`\`

Instructions:
1. If the user input is explicitly asking to modify the code, update the design, or fix an issue:
   - Produce the complete, updated HTML (only the body content) and wrap it EXPLICITLY in \`\`\`html ... \`\`\`. 
   - Do NOT include any explanation or commentary. 
   - Do NOT append a new copy of sections. Modify the existing structure in-place.
   - For any new images, use: \`/api/unsplash?query=[keyword]\`.

2. If the user input is a general question, greeting, or does NOT require code changes (e.g., "Hello", "What did I ask?"):
   - Respond with a simple, friendly text message. 
   - Do NOT generate any HTML code.`;

      payloadMessages.push({ role: 'system', content: editSystem });
      if (localMessages && localMessages.length > 0) payloadMessages.push(...localMessages);
    } else {
      // fresh generation: keep original Prompt behaviour
      payloadMessages.push({ role: 'system', content: Prompt.replace('{userInput}', userInput) });
      if (localMessages && localMessages.length > 0) payloadMessages.push(...localMessages);
    }

    const result = await fetch('/api/ai-model', {
      method: 'POST',
      body: JSON.stringify({ messages: payloadMessages }),
    });

    const reader = result.body?.getReader();
    const decoder = new TextDecoder();

    let aiResponse = '';
    let isCode = false;

    while (true) {
      // @ts-ignore
      const { done, value } = await reader?.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      aiResponse += chunk;

      if (!isCode && aiResponse.includes('```html')) {
        isCode = true;
        const index = aiResponse.indexOf('```html') + 7;
        const initialCodeChunk = aiResponse.slice(index);
        setGeneratedCode(initialCodeChunk);
      } else if (isCode) {
        setGeneratedCode((prev: any) => (prev ?? '') + chunk);
      }
    }

    await SaveGeneratedCode(aiResponse);
    if (!isCode) {
      setMessages((prev: any) => [
        ...prev,
        { role: 'assistant', content: aiResponse }
      ]);
    } else {
      setMessages((prev: any) => [
        ...prev,
        { role: 'assistant', content: 'Your code is ready!' }
      ]);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (messages && messages.length > 0) {
      SaveMessages();
    }
  }, [messages])

  // useEffect(() => {
  //   console.log(generatedCode)
  // }, [generatedCode])



  const SaveMessages = async () => {
    const result = await axios.put('/api/chats', {
      messages: messages,
      frameId: frameId
    })

    console.log(result)
  }



  const SaveGeneratedCode = async (code: string) => {
    const result = await axios.put('/api/frames', {
      designCode: code,
      frameId: frameId,
      projectId: projectId
    });

    console.log(result.data);

    toast.success('Website is Ready!')
  }


  return (
    <div>
      <PlaygroundHeader />

      <div className='flex'>
        {/* Chat Section  */}
        <ChatSection messages={messages ?? []} onSend={(input: string) => SendMessage(input)} loading={loading} />
        {/* Website design */}
        <WebsiteDesign generatedCode={generatedCode?.replace('```', '')} />

      </div>

    </div>
  )
}

export default PlayGround
