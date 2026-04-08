import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SectionCard({ description, title, percentage, url, buttonLabel, footer_description, currency, className }
  : React.ComponentProps<"div"> & { description: string, title: string, percentage: number, url: string, buttonLabel: string, footer_description: string, currency: string }) {
  const navigate = useNavigate();
  return (
    <Card className={className}>
      <CardHeader>
        <CardDescription>{description}</CardDescription>
        <CardTitle>{title} {currency}</CardTitle>
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
          {footer_description}
          <Button variant="link" className="text-sm" onClick={() => navigate(url)}>{buttonLabel}</Button>
        </div>
      </CardFooter>
    </Card>
  )
}