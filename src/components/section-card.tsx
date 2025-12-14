import { TrendingUp } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

export default function SectionCard({ description, title }: { description: string, title: string }) {
    return (
        <Card>
            <CardHeader>
                <CardDescription>{description}</CardDescription>
                <CardTitle>{title}</CardTitle>
                <CardAction>
                    <Badge variant={"outline"}>
                        <TrendingUp/>
                            +34%
                    </Badge>
                </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    Trending up this month <TrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                    Visitors for the last 6 months
                </div>
            </CardFooter>
        </Card>
    )
}