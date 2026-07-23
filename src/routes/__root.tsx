import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BookFab } from "../components/book-fab";

const criticalMobileCss = `
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;background:#3a2418}body{margin:0;background:#3a2418;color:#e8c07a;font-family:Inter,Arial,sans-serif}img,svg{display:block;max-width:100%}a{color:inherit;text-decoration:none}button,input,select,textarea{font:inherit}.font-serif{font-family:"Cormorant Garamond",Georgia,serif}.font-sans{font-family:Inter,Arial,sans-serif}.fixed{position:fixed}.relative{position:relative}.absolute{position:absolute}.inset-0{inset:0}.top-0{top:0}.top-3{top:.75rem}.left-3{left:.75rem}.z-50{z-index:50}.mx-auto{margin-left:auto;margin-right:auto}.mt-auto{margin-top:auto}.mt-6{margin-top:1.5rem}.mb-1{margin-bottom:.25rem}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}.mb-10{margin-bottom:2.5rem}.ml-1{margin-left:.25rem}.block{display:block}.inline{display:inline}.inline-flex{display:inline-flex}.flex{display:flex}.grid{display:grid}.hidden{display:none}.size-4{width:1rem;height:1rem}.size-6{width:1.5rem;height:1.5rem}.h-16{height:4rem}.w-full{width:100%}.min-h-screen{min-height:100vh}.max-w-2xl{max-width:42rem}.max-w-3xl{max-width:48rem}.max-w-7xl{max-width:80rem}.min-w-0{min-width:0}.shrink-0{flex-shrink:0}.flex-1{flex:1 1 0%}.flex-col{flex-direction:column}.items-center{align-items:center}.items-end{align-items:flex-end}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.overflow-hidden{overflow:hidden}.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.border{border-width:1px}.border-b{border-bottom-width:1px}.border-t{border-top-width:1px}.border-gold\/10{border-color:rgba(201,168,76,.1)}.border-gold\/20{border-color:rgba(201,168,76,.2)}.border-gold\/30{border-color:rgba(201,168,76,.3)}.border-gold\/40{border-color:rgba(201,168,76,.4)}.bg-deep{background-color:#3a2418}.bg-deep\/60{background-color:rgba(58,36,24,.6)}.bg-deep\/85{background-color:rgba(58,36,24,.85)}.bg-deep\/95{background-color:rgba(58,36,24,.95)}.bg-gold{background-color:#c9a84c}.bg-warm\/5{background-color:rgba(107,58,42,.05)}.bg-warm\/10{background-color:rgba(107,58,42,.1)}.object-cover{object-fit:cover}.p-1{padding:.25rem}.p-2{padding:.5rem}.p-5{padding:1.25rem}.p-6{padding:1.5rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-4{padding-left:1rem;padding-right:1rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.py-4{padding-top:1rem;padding-bottom:1rem}.py-16{padding-top:4rem;padding-bottom:4rem}.py-20{padding-top:5rem;padding-bottom:5rem}.pt-4{padding-top:1rem}.pt-16{padding-top:4rem}.pt-24{padding-top:6rem}.pb-1{padding-bottom:.25rem}.pb-32{padding-bottom:8rem}.text-center{text-align:center}.text-xs{font-size:.75rem;line-height:1rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-2xl{font-size:1.5rem;line-height:2rem}.text-5xl{font-size:clamp(2.25rem,11vw,3rem);line-height:1.05}.font-medium{font-weight:500}.uppercase{text-transform:uppercase}.leading-relaxed{line-height:1.625}.leading-tight{line-height:1.1}.tracking-\[0\.15em\]{letter-spacing:.15em}.tracking-\[0\.2em\]{letter-spacing:.2em}.tracking-\[0\.25em\]{letter-spacing:.25em}.tracking-\[0\.3em\]{letter-spacing:.3em}.tracking-\[0\.4em\]{letter-spacing:.4em}.text-deep{color:#3a2418}.text-gold{color:#c9a84c}.text-gold-light{color:#e8c07a}.text-gold-light\/50{color:rgba(232,192,122,.5)}.text-gold-light\/70{color:rgba(232,192,122,.7)}.text-gold-light\/80{color:rgba(232,192,122,.8)}.text-gold\/70{color:rgba(201,168,76,.7)}.text-zinc-300\/80{color:rgba(212,212,216,.8)}.text-zinc-300\/85{color:rgba(212,212,216,.85)}.text-zinc-400{color:#a1a1aa}.text-zinc-500{color:#71717a}.opacity-40{opacity:.4}.outline-none{outline:2px solid transparent;outline-offset:2px}.ring-1{box-shadow:0 0 0 1px var(--fallback-ring,rgba(201,168,76,.1))}.ring-gold\/10{--fallback-ring:rgba(201,168,76,.1)}.ring-gold\/20{--fallback-ring:rgba(201,168,76,.2)}.transition-colors{transition:color .2s,background-color .2s,border-color .2s}.transition-transform{transition:transform .7s}.duration-1000{transition-duration:1s}.duration-300{transition-duration:.3s}.max-h-0{max-height:0}.max-h-96{max-height:24rem}.rounded-\[6px\]{border-radius:6px}.antialiased{-webkit-font-smoothing:antialiased}.backdrop-blur-md{backdrop-filter:blur(12px)}.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.aspect-\[4\/3\]{aspect-ratio:4/3}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}main article{min-width:0}main article img{width:100%;height:100%}main input,main select{min-height:44px;border-radius:0}.hover\:bg-gold-light:hover{background-color:#e8c07a}.hover\:text-gold:hover{color:#c9a84c}.hover\:border-gold:hover{border-color:#c9a84c}@media(max-width:767px){nav .max-w-7xl{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center}nav a.font-serif{font-size:1rem;letter-spacing:.12em}.md\:hidden{display:block}.md\:flex{display:none}.md\:grid-cols-4{grid-template-columns:repeat(1,minmax(0,1fr))}.md\:px-4{padding-left:1rem;padding-right:1rem}main{overflow-x:hidden}.px-6{padding-left:1rem;padding-right:1rem}.py-16{padding-top:2.5rem;padding-bottom:2.5rem}.p-6{padding:1rem}.p-5{padding:1rem}.text-5xl{font-size:2.45rem}.tracking-\[0\.4em\]{letter-spacing:.22em}.tracking-\[0\.3em\],.tracking-\[0\.25em\]{letter-spacing:.18em}}@media(min-width:640px){.sm\:inline{display:inline}.sm\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.sm\:text-lg{font-size:1.125rem;line-height:1.75rem}}@media(min-width:768px){.md\:hidden{display:none}.md\:flex{display:flex}.md\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.md\:gap-8{gap:2rem}.md\:px-6{padding-left:1.5rem;padding-right:1.5rem}.md\:px-4{padding-left:1rem;padding-right:1rem}.md\:text-xl{font-size:1.25rem;line-height:1.75rem}.md\:text-6xl{font-size:3.75rem;line-height:1}.md\:tracking-\[0\.2em\]{letter-spacing:.2em}}@media(min-width:1024px){.lg\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}}
.site-nav-links{display:none}.site-menu-button{display:block}.site-mobile-menu{display:block}.grid-cols-\[minmax\(0\,1fr\)_auto\]{grid-template-columns:minmax(0,1fr) auto}.inset-x-0{left:0;right:0}.justify-end{justify-content:flex-end}.bg-deep\/90{background-color:rgba(58,36,24,.9)}.bg-warm\/20{background-color:rgba(107,58,42,.2)}.border-gold\/25{border-color:rgba(201,168,76,.25)}@media(max-width:1023px){nav .max-w-7xl{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center}main{overflow-x:hidden}main img{max-height:62vh}}@media(min-width:1024px){.site-nav-links{display:flex}.site-menu-button,.site-mobile-menu{display:none}.lg\:inline{display:inline}.lg\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.lg\:text-xl{font-size:1.25rem;line-height:1.75rem}.lg\:tracking-\[0\.2em\]{letter-spacing:.2em}}
`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Garen's Garden — A Reborn Boutique Bed & Breakfast" },
      {
        name: "description",
        content:
          "Garen's Garden is Obiaruku's finest boutique bed & breakfast reborn in 2026. Complimentary breakfast, 24/7 solar power, secure premises, and warm, personalized hospitality.",
      },
      { name: "author", content: "Garen's Garden" },
      { name: "theme-color", content: "#0b0b0b" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Garen's Garden" },
      { property: "og:title", content: "Garen's Garden — A Reborn Boutique Bed & Breakfast" },
      {
        property: "og:description",
        content:
          "Garen's Garden is a 21-room boutique bed & breakfast reborn in 2026. Complimentary breakfast, 24/7 solar power, secure premises, and warm, personalized hospitality.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Garen's Garden — A Reborn Boutique Bed & Breakfast" },
      { name: "twitter:description", content: "Garen's Garden is a 21-room boutique bed & breakfast reborn in 2026. Complimentary breakfast, 24/7 solar power, secure premises, and warm, personalized hospitality." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/354f4698-456c-4f12-8508-8210c7f0b478/id-preview-0371f586--7f8ad589-8bee-4fb9-b24d-c4e825c170d3.lovable.app-1784029420287.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/354f4698-456c-4f12-8508-8210c7f0b478/id-preview-0371f586--7f8ad589-8bee-4fb9-b24d-c4e825c170d3.lovable.app-1784029420287.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/app-icon-512.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalMobileCss }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { Toaster } from "../components/ui/sonner";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <BookFab />
      <Toaster />
    </QueryClientProvider>
  );
}

