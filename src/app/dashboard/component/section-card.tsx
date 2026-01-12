import { Minus, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AppConstant } from "@/interfaces/app-common";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SectionCard({ name, description, title, percentage, url }
    :{ name: string, description: string, title: string, percentage: number, url: string }) {
    const navigate = useNavigate();
    return (
        <Card>
            <CardHeader>
                <CardDescription>{description}</CardDescription>
                <CardTitle>{title} {AppConstant.DATA.DEFAULT_CURRENCY}</CardTitle>
                <CardAction>
                    <Badge variant={"outline"}>
                        {
                            percentage > 0 ? <TrendingUp /> : percentage < 0 ? <TrendingUp /> : <></>

                        }
                        <span> {Math.abs(percentage).toFixed(2)}%</span>
                    </Badge>
                </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="line-clamp-1 flex items-center gap-2 font-medium">
                    {`Your ${name} is ${percentage > 0 ? "increase" : percentage < 0 ? "decrease" : "stable"} ${Math.abs(percentage).toFixed(2)} % in this month`}
                    <Button variant="link" className="text-sm" onClick={() => navigate(url)}>View details</Button>
                </div>
            </CardFooter>
        </Card>
    )
}