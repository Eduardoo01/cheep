import type { PropsWithChildren } from "react";

export const Layout = (props: PropsWithChildren) => {
  return (
    <main className="overflow-none">
      <div className="h-full w-full">{props.children}</div>
    </main>
  );
};
