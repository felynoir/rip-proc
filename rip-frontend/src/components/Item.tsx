import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CardProps = React.ComponentProps<typeof Card> & {
  title: string;
};

import { Link } from "react-router-dom";

export function Item({ title, className, ...props }: CardProps) {
  return (
    <Card
      className={cn(
        "w-[380px]",
        "transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-gray-50 transition-color hover:cursor-pointer",
        className
      )}
      {...props}
      onClick={() => alert("clicked")}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Link to={"/"}>
          <p>This is some card content.</p>
        </Link>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
