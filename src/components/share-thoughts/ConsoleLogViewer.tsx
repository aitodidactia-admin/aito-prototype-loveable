
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConsoleLogViewerProps {
  consoleOutput: string[];
}

const ConsoleLogViewer = ({ consoleOutput }: ConsoleLogViewerProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" type="button" className="w-full">
          View Console Logs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Console Logs</DialogTitle>
        </DialogHeader>
        <div className="bg-black text-white p-4 rounded-md font-mono text-sm overflow-x-auto">
          {consoleOutput.length > 0 ? (
            consoleOutput.map((log, i) => (
              <div key={i} className="whitespace-pre-wrap mb-1">{log}</div>
            ))
          ) : (
            <div className="text-gray-400">No console logs yet. Try previewing or sending a message.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsoleLogViewer;
