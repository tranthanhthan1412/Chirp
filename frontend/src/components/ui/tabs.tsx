import { Tabs as Primitive } from "@base-ui/react/tabs";
import { cn } from "@/lib/utils";

export const Tabs = Primitive.Root;
export function TabsList({ className, ...props }: Primitive.List.Props) {
  return <Primitive.List className={cn("flex gap-1 rounded-lg bg-muted p-1", className)} {...props} />;
}
export function TabsTrigger({ className, ...props }: Primitive.Tab.Props) {
  return <Primitive.Tab className={cn("flex-1 rounded-md px-3 py-2 text-sm text-muted-foreground outline-none data-active:bg-background data-active:text-foreground data-active:shadow-sm focus-visible:ring-2 focus-visible:ring-ring", className)} {...props} />;
}
export function TabsContent({ className, ...props }: Primitive.Panel.Props) {
  return <Primitive.Panel className={cn("mt-4 outline-none", className)} {...props} />;
}
