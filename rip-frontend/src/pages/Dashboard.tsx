import { Item } from "../components/Item";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";

function Dashboard() {
  return (
    <>
      <div className="flex gap-6 w-3/5 m-10">
        <Item title="shame" className="w-[240px]" />
        <Item title="shame" className="w-[240px]" />
        <Item title="shame" className="w-[240px]" />
      </div>
      <Separator orientation="vertical" />
      <div className="flex w-2/5 flex-1 items-center justify-center">
        <Button className="py-8 px-10 text-xl">Leave your legacy {"->"}</Button>
      </div>
    </>
  );
}

export default Dashboard;
