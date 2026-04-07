import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="flex flex-col gap-0.5">
      <p>
        <Link className="font-heading font-semibold text-lg" href="/">
          creantly.com <span className="text-muted-foreground/72">ui</span>
        </Link>
      </p>
      <p className="text-muted-foreground text-sm">
        Built by and for the team of{" "}
        <a
          className="font-medium underline-offset-4 hover:underline"
          href="https://hookra.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          hookra.com
        </a>
        , Inc. — the leading commercial open source company
        (&ldquo;creantly&rdquo;).
      </p>
    </footer>
  );
}
