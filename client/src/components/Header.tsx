import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ModeToggle } from './ui/mode-toggle';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { githubIconPath } from '@/lib/svg-paths';

export default function Header({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();

  return (
    <div className="fixed left-0 right-0 top-0 z-10 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between p-3">

        {/* logo and title */}
        <div className="flex items-center">
          <img className="mx-2" width="30" src="/images/logo.png" alt="Logo" />
          <h3 className="scroll-m-20 text-2xl font-medium tracking-tight">
            News Article Collector
          </h3>
        </div>
        <div className="grow"></div>

        {/* navigation buttons */}
        <nav className="flex flex-grow items-center justify-end">
          {['Dashboard', 'Search', 'Statistics', 'Errors', 'Info'].map(
            (item) => {
              const path = `/${item.toLowerCase()}`;
              const isActive = location.pathname === path;
              return (
                <React.Fragment key={item}>
                  <Link
                    to={path}
                    className={cn(
                      'px-4 py-2 text-sm font-medium transition-colors',
                      'hover:text-primary',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {item}
                  </Link>
                </React.Fragment>
              );
            }
          )}
        </nav>
        <div className="mx-2 h-5 w-px bg-gray-200 dark:bg-gray-700" />

        {/* github, theme and logout */}
        <div className="flex items-center">
          <Button asChild variant="ghost" className="mr-1" size="icon">
            <a
              href="https://github.com/uh-dcm/news-article-collection-container"
              aria-label="GitHub repository"
              target="_blank"
              rel="noopener noreferrer"
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

          <div className="relative inline-flex">
            <ModeToggle />
          </div>

          <Button onClick={onLogout} variant="outline" className="mx-2">
            <div className="">Log out</div>
          </Button>
        </div>
      </div>

    </div>
  );
}
