import React, { useContext, useEffect, useRef, useState } from 'react'
import WebPageTools from './WebPageTools';
import ElementSettingSection from './ElementSettingSection';
import ImageSettingSection from './ImageSettingsSection';
import { OnSaveContext } from '@/context/OnSaveContext';
import axios from 'axios';
import { toast } from 'sonner';
import { useParams, useSearchParams } from 'next/navigation';

type Props = {
    generatedCode: string
}
const HTML_CODE = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>AI Website Builder</title>

          <!-- Tailwind CSS -->
          <script src="https://cdn.tailwindcss.com"></script>

          <!-- Flowbite CSS & JS -->
          <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>

          <!-- Font Awesome / Lucide -->
          <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

          <!-- Chart.js -->
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

      </head>
      <body id="root"></body>
      </html>`;



function WebsiteDesign({ generatedCode }: Props) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const hoverElRef = useRef<HTMLElement | null>(null);
    const selectedElRef = useRef<HTMLElement | null>(null);
    const settingsContainerRef = useRef<HTMLDivElement | null>(null);
    const [selectedScreenSize, setSelectedScreenSize] = useState('web');
    const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
    const { onSaveData, setOnSaveData } = useContext(OnSaveContext);
    const { projectId } = useParams();
    const params = useSearchParams();
    const frameId = params.get('frameId');
    // Initialize iframe shell once
    useEffect(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        doc.open();
        doc.write(HTML_CODE);
        doc.close();

        // Ensure a base href exists so relative image URLs resolve inside the iframe
        try {
            const base = doc.createElement('base');
            base.setAttribute('href', window.location.origin + '/');
            const existing = doc.head?.querySelector('base');
            if (existing) existing.remove();
            doc.head?.appendChild(base);
        } catch (e) {}

        // track hovered and selected elements across handlers (use outer refs)



        const handleMouseOver = (e: MouseEvent) => {
            if (selectedElRef.current) return;
            const target = e.target as HTMLElement;
            if (hoverElRef.current && hoverElRef.current !== target) {
                try { hoverElRef.current.style.outline = ""; } catch (e) {}
            }
            hoverElRef.current = target;
            try { hoverElRef.current.style.outline = "2px dotted blue"; } catch (e) {}
        };

        const handleMouseOut = (e: MouseEvent) => {
            if (selectedElRef.current) return;
            if (hoverElRef.current) {
                try { hoverElRef.current.style.outline = ""; } catch (e) {}
                hoverElRef.current = null;
            }
        };

        const handleClick = (e: MouseEvent) => {
            // allow clicks but stop navigation / script triggers from interfering
            e.preventDefault();
            e.stopPropagation();
            const target = e.target as HTMLElement;

            if (selectedElRef.current && selectedElRef.current !== target) {
                try { selectedElRef.current.style.outline = ""; } catch (err) {}
                try { selectedElRef.current.removeAttribute("contenteditable"); } catch (err) {}
            }

            selectedElRef.current = target;
            try { selectedElRef.current.style.outline = "2px solid red"; } catch (err) {}
            try { selectedElRef.current.setAttribute("contenteditable", "true"); } catch (err) {}
            try { (selectedElRef.current as HTMLElement).focus(); } catch (err) {}
            console.log("Selected element:", selectedElRef.current);
            setSelectedElement(selectedElRef.current);
        };

        const handleBlur = (e?: FocusEvent) => {
            if (!selectedElRef.current) return;
            try {
                // if parent has flagged that a settings click occurred, ignore this blur
                const ignore = iframeRef.current?.dataset?.ignoreBlur === '1';
                if (ignore) {
                    // clear flag and skip clearing selection
                    try { if (iframeRef.current) iframeRef.current.dataset.ignoreBlur = '0'; } catch (err) {}
                    return;
                }
                const el = selectedElRef.current;
                // if focus moved outside the selected element, finalize
                const active = doc.activeElement as HTMLElement | null;
                if (active !== el) {
                    console.log("Final edited element:", el.outerHTML);
                    try { el.style.outline = ""; } catch (err) {}
                    try { el.removeAttribute("contenteditable"); } catch (err) {}
                    selectedElRef.current = null;
                    setSelectedElement(null);
                }
            } catch (err) {
                // ignore
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedElRef.current) {
                try { selectedElRef.current.style.outline = ''; } catch (err) {}
                try { selectedElRef.current.removeAttribute('contenteditable'); } catch (err) {}
                selectedElRef.current = null;
                setSelectedElement(null);
            }
        };

        // Attach listeners to the iframe document
        doc.addEventListener('mouseover', handleMouseOver, true);
        doc.addEventListener('mouseout', handleMouseOut, true);
        doc.addEventListener('click', handleClick, true);
        doc.addEventListener('focusout', handleBlur, true);
        doc.addEventListener('keydown', handleKeyDown, true);

        // cleanup on unmount
        const removeListeners = () => {
            try { doc.removeEventListener('mouseover', handleMouseOver, true); } catch (e) {}
            try { doc.removeEventListener('mouseout', handleMouseOut, true); } catch (e) {}
            try { doc.removeEventListener('click', handleClick, true); } catch (e) {}
            try { doc.removeEventListener('focusout', handleBlur, true); } catch (e) {}
            try { doc.removeEventListener('keydown', handleKeyDown, true); } catch (e) {}
        };

        // ensure listeners removed if iframe is torn down
        (iframeRef.current as HTMLIFrameElement).addEventListener('load', () => {
            // no-op for now, but safe place to re-attach if needed later
        });

        // react cleanup
        return () => {
            removeListeners();
        };

    }, []);


    // Update body only when code changes
    useEffect(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        const root = doc.getElementById("root");
        if (root) {

            let html = generatedCode ?? "";

            // clear any existing selection refs before replacing DOM to avoid stale element references
            if (selectedElRef.current) {
                try { selectedElRef.current.style.outline = ''; } catch (e) {}
                selectedElRef.current = null;
                setSelectedElement(null);
            }

            // If we've been given a full HTML document, extract only the body content
            if (/\<body[\s\S]*?>[\s\S]*?<\/body>/i.test(html)) {
                const m = html.match(/\<body[\s\S]*?>([\s\S]*?)<\/body>/i);
                html = m ? m[1] : html;
            }

            // Strip code fences if present
            html = html.replaceAll("```html", "").replaceAll("```", "").replace("html", "");

            // Convert some common JSX <Image src={"..."} /> patterns to plain <img src="..." /> for iframe rendering
            try {
                html = html.replace(/<Image[^>]*src=\{?\s*["']([^"'}]+)["']\s*\}?[^>]*\/>/gi, '<img src="$1" />');
                html = html.replace(/<Image[^>]*src=\{?\s*([^\s}]+)\s*\}?[^>]*\/>/gi, '<img src="$1" />');
            } catch (e) {
                // ignore regex errors
            }

            root.innerHTML = html;

            // clear hover ref to avoid pointing at removed nodes
            try { hoverElRef.current = null; } catch (e) {}

            // Fix relative image paths inside the iframe by prefixing the current origin
            try {
                const imgs = root.querySelectorAll('img');
                const origin = window.location.origin;
                imgs.forEach((img) => {
                    const src = img.getAttribute('src') || '';
                    if (src.startsWith('/')) img.setAttribute('src', origin + src);
                    // if src is empty or uses React-style placeholders, leave it — user can set via ImageSettings
                });
            } catch (e) {}
        }
    }, [generatedCode]);

    useEffect(() => {
        onSaveData && onSaveCode();

    }, [onSaveData]);

    // When the user clicks inside the settings panel (parent UI), we want to avoid
    // the iframe focusout handler from clearing the selection. Set a short-lived
    // flag on the iframe element so the iframe blur handler can ignore it.
    useEffect(() => {
        const onMouseDown = (ev: MouseEvent) => {
            try {
                const settingsEl = settingsContainerRef.current;
                if (!settingsEl) return;
                const path = (ev.composedPath && ev.composedPath()) || (ev as any).path || [];
                const clickedInside = path.includes ? path.includes(settingsEl) : settingsEl.contains(ev.target as Node);
                if (clickedInside && iframeRef.current) {
                    iframeRef.current.dataset.ignoreBlur = '1';
                    // clear after short timeout
                    setTimeout(() => {
                        try { if (iframeRef.current) iframeRef.current.dataset.ignoreBlur = '0'; } catch (e) {}
                    }, 300);
                }
            } catch (e) {}
        };

        window.addEventListener('mousedown', onMouseDown);
        return () => window.removeEventListener('mousedown', onMouseDown);
    }, []);

    const onSaveCode = async () => {
        if (iframeRef.current) {
            try {
                const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;

                if (iframeDoc) {
                    const cloneDoc = iframeDoc.documentElement.cloneNode(true) as HTMLElement;

                    const AllEls = cloneDoc.querySelectorAll<HTMLElement>('*');

                    AllEls.forEach((el) => {
                        el.style.outline = '';
                        el.style.cursor = '';
                    });

                    const html = cloneDoc.outerHTML;

                    console.log('HTML to save', html);

                    const result = await axios.put('/api/frames', {
                        designCode: html,
                        frameId: frameId,
                        projectId: projectId
                    });

                    console.log(result.data);

                    toast.success('Saved Successfully!')
                }



            } catch (e) {
                console.log(e);
            }
        }
    }

    return (
        <div className='flex gap-2 w-full'>
            <div className='p-5 w-full flex items-center flex-col'>
                <iframe
                    ref={iframeRef}
                    className={`${selectedScreenSize == 'web' ? 'w-full' : 'w-[40%]'} h-142 border-2 rounded-xl`}
                    sandbox="allow-scripts allow-same-origin"
                />
                <WebPageTools generatedCode={generatedCode} selectedScreenSize={selectedScreenSize} setSelectedScreenSize={(v: string) => setSelectedScreenSize(v)} />

            </div>
            {/* Setting */}
            {/* @ts-ignore */}
            {/* <ElementSettingSection selectedEl={selectedElement} clearSelection={() => setSelectedElement(null)}/> */}

            <div ref={settingsContainerRef}>
            {selectedElement?.tagName == 'IMG' ?
                // @ts-ignore
                <ImageSettingSection selectedEl={selectedElement} />
                : selectedElement ? <ElementSettingSection selectedEl={selectedElement} clearSelection={() => setSelectedElement(null)} /> : null
            }
            </div>
        </div>
    );
}
export default WebsiteDesign