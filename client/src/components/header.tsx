import React from 'react';
import { ExitIcon } from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Link, useLocation } from 'react-router-dom';
import { ModeToggle } from './ui/mode-toggle';
import { Button } from './ui/button';
import { cn } from "@/lib/utils";
import { githubIconPath } from "@/lib/svg-paths";

export default function Header({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();

  return (
    <div className="fixed left-0 right-0 top-0 z-10 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between p-3">

        {/* logo and title */}
        <div className="flex items-center">
          <img
            className="mx-2"
            width="30"
            src="/images/logo.png"
            alt="Logo"
          />
          <h3 className="scroll-m-20 text-2xl font-medium tracking-tight">
            News Article Collector
          </h3>
        </div>

        {/* navigation buttons */}
        <nav className="flex-grow flex justify-center items-center">
          {["Dashboard", "Search", "Statistics", "Errors"].map((item, index) => {
            const path = `/${item.toLowerCase()}`;
            const isActive = location.pathname === path;
            return (
              <React.Fragment key={item}>
                {index > 0 && (
                  <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
                )}
                <Link
                  to={path}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors",
                    "hover:text-primary",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item}
                </Link>
              </React.Fragment>
            );
          })}
        </nav>

        {/* logout, github and theme */}
        <div className="flex items-center">

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Button onClick={onLogout} variant="ghost" className="mr-1" size="icon">
                <ExitIcon className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>Logout</p>
            </Tooltip.Content>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Button asChild variant="ghost" className="mr-1" size="icon">
                <a
                  href="https://github.com/uh-dcm/news-article-collection-container"
                  aria-label="GitHub repository"
                >
                  {/*github icon by Free Icons (https://free-icons.github.io/free-icons/)*/}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-[1.2rem] w-[1.2rem]"
                    fill="currentColor"
                    viewBox="0 0 512 512"
                  >
                    <path d={githubIconPath} />
                  </svg>
                </a>
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>GitHub</p>
            </Tooltip.Content>
          </Tooltip.Root>

          {/*dropdown gets tooltip stuck, I wish there was a "disappear after x time"*/}
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div className="relative inline-flex">
                <ModeToggle />
              </div>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>Theme</p>
            </Tooltip.Content>
          </Tooltip.Root>
          
        </div>
      </div>
    </div>
  );
}
