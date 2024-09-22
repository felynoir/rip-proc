import { Item } from "../components/Item";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useDecryption } from "@/hook";

function Dashboard() {
  const { ciphers, fKeys } = useDecryption();
  console.log("ciphers", ciphers);
  console.log("fKeys", fKeys);
  const attestable = ciphers && fKeys && ciphers.length > 0 && fKeys.length > 0;
  return (
    <>
      <div className="flex gap-6 w-3/5 m-10">
        {attestable && (
          <Card
            className={cn(
              "w-[380px]",
              "transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-gray-50 transition-color hover:cursor-pointer"
            )}
            onClick={() => alert("Loading your DNA 👀 Please wait...")}
          >
            <CardHeader>
              <CardTitle>Legacy of John</CardTitle>
            </CardHeader>
            <CardContent>
              <Link to={"/"}>
                <p>Attest with your DNA 👀</p>
              </Link>
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        )}
      </div>
      <Separator orientation="vertical" />
      <div className="flex w-2/5 flex-1 items-center justify-center">
        <Button className="py-8 px-10 text-xl">Leave your legacy {"->"}</Button>
      </div>
    </>
  );
}

export default Dashboard;
