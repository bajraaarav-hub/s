'use client';
import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
import {Check, Clipboard} from 'lucide-react';
import React, {useState} from 'react';

export function CodeBlock({code}: {code: string}) {
  const [copied, setCopied] = useState(false);
  const {toast} = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: 'Copied to clipboard!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative font-code">
      <pre className="bg-muted text-muted-foreground p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-8 w-8" onClick={handleCopy}>
        {copied ? <Check className="h-4 w-4 text-accent" /> : <Clipboard className="h-4 w-4" />}
      </Button>
    </div>
  );
}
