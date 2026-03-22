"use client";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader } from "./ui/dialog";

export default function ErrorDialog({ open, title, message, openChange, children }: { open: boolean; title: string; message: string[]; openChange: (open: boolean) => void; children: React.ReactNode; }) {
    return (
        <Dialog open={open} onOpenChange={openChange} >
            <DialogContent>
                <DialogHeader>
                    {title}
                </DialogHeader>
                <DialogDescription>
                    {message.map((msg, index) => (
                        <p key={index}>{msg}</p>
                    ))}
                </DialogDescription>
                {children}
                <DialogFooter>
                    <Button onClick={() => openChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
