import { BellRing, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";

type CardProps = React.ComponentProps<typeof Card>;

export function Entry({ className, ...props }: CardProps) {
  return (
    <Card className={cn("w-[380px]", className)} {...props}>
      <CardHeader>
        {/* <CardDescription>You have 3 unread messages.</CardDescription> */}
      </CardHeader>
      <CardContent className="grid gap-4 justify-center">
        <div className="flex items-center gap-4">Rip Protocol</div>
      </CardContent>
      <CardFooter>
        <Link to="/dashboard" className="w-full">
          <Button className="w-full">
            <Check className="mr-2 h-4 w-4" /> Login
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
