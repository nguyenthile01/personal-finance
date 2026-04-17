
"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DialogForm({
    title,
    description,
    open,
    OKBtnName,
    onOpenChange,
    OKFunc,
    children
}: React.ComponentProps<"div"> & {
    title: string,
    description?: React.ReactNode,
    open: boolean;
    OKBtnName?: string,
    onOpenChange: (open: boolean) => void,
    OKFunc: () => void,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()} className="sm:max-w-lg">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    OKFunc()
                }}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>{description || null}</DialogDescription>
                    {/* Form fields go here */}
                    <div className="my-4">
                        {children}
                    </div>
                    <DialogFooter>
                        {/* Action buttons go here */}
                        <Button variant="outline" className="py-2 rounded" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button className="py-2 rounded" type="submit">{OKBtnName || "OK"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}