import { GeneratorWorkspace } from "@/components/workspace/GeneratorWorkspace";
import { SiteHeader } from "@/components/workspace/SiteHeader";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        tabIndex={-1}
        className="flex flex-1 flex-col outline-none"
      >
        <GeneratorWorkspace />
      </main>
    </>
  );
}
