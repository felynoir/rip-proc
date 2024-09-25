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
import { Link, useNavigate } from "react-router-dom";
import { useDecryption, useInformation } from "@/hook";

function Dashboard() {
  const { attestable } = useInformation();
  const navigate = useNavigate();

  return (
    <>
      <div className="flex gap-6 w-3/5 m-10">
        {attestable ? (
          <Card
            className={cn(
              "w-[380px]",
              "transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-gray-50 transition-color hover:cursor-pointer"
            )}
            onClick={() => {
              alert("Loading your DNA 👀 Please wait...");
              navigate("/information");
            }}
          >
            <CardHeader>
              <CardTitle>Legacy of John</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Attest with your DNA 👀</p>
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        ) : (
          <>None</>
        )}
      </div>
      <Separator orientation="vertical" />
      <div className="flex w-2/5 flex-1 items-center justify-center">
        <Button
          onClick={() => navigate("/information")}
          className="py-8 px-10 text-xl"
        >
          Leave your legacy {"->"}
        </Button>
      </div>
    </>
  );
}

export default Dashboard;
