'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface PDFViewerProps {
  downloadUrl: string;
  titulo: string;
  onClose: () => void;
}

export function PDFViewer({ downloadUrl, titulo, onClose }: PDFViewerProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0">
          <h2 className="font-semibold text-gray-900 truncate max-w-[60%]">{titulo}</h2>
          <div className="flex items-center gap-2">
            <a
              href={downloadUrl}
              download={titulo}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Baixar PDF
              </Button>
            </a>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <iframe
          src={downloadUrl}
          className="flex-1 w-full border-0"
          title={titulo}
        />
      </DialogContent>
    </Dialog>
  );
}
