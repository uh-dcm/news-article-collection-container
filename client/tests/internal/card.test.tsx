
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

describe('Card component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders card component', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>RSS Feed Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>Add, Select or Delete feeds</CardDescription>
        </CardContent>
        <CardFooter>
          <button>Save Changes</button>
        </CardFooter>
      </Card>
    );
    const headerElement = screen.getByText('RSS Feed Manager');
    const bodyElement = screen.getByText('Add, Select or Delete feeds');
    const footerElement = screen.getByText('Save Changes');

    expect(headerElement).toBeInTheDocument();
    expect(bodyElement).toBeInTheDocument();
    expect(footerElement).toBeInTheDocument();
  });

  it('renders card component without footer', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>RSS Feed Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>Add, Select or Delete feeds</CardDescription>
        </CardContent>
      </Card>
    );
    const headerElement = screen.getByText('RSS Feed Manager');
    const bodyElement = screen.getByText('Add, Select or Delete feeds');
    const footerElement = screen.queryByText('Save Changes');

    expect(headerElement).toBeInTheDocument();
    expect(bodyElement).toBeInTheDocument();
    expect(footerElement).not.toBeInTheDocument();
  });

  it('renders card component without header', () => {
    render(
      <Card>
        <CardContent>
          <CardDescription>Add, Select or Delete feeds</CardDescription>
        </CardContent>
        <CardFooter>
          <button>Save Changes</button>
        </CardFooter>
      </Card>
    );
    const bodyElement = screen.getByText('Add, Select or Delete feeds');
    const footerElement = screen.getByText('Save Changes');
    const headerElement = screen.queryByText('RSS Feed Manager');

    expect(bodyElement).toBeInTheDocument();
    expect(footerElement).toBeInTheDocument();
    expect(headerElement).not.toBeInTheDocument();
  });

  it('renders card component without content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>RSS Feed Manager</CardTitle>
        </CardHeader>
        <CardFooter>
          <button>Save Changes</button>
        </CardFooter>
      </Card>
    );
    const headerElement = screen.getByText('RSS Feed Manager');
    const footerElement = screen.getByText('Save Changes');
    const bodyElement = screen.queryByText('Add, Select or Delete feeds');

    expect(headerElement).toBeInTheDocument();
    expect(footerElement).toBeInTheDocument();
    expect(bodyElement).not.toBeInTheDocument();
  });

  it('renders card component with empty content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>RSS Feed Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription></CardDescription>
        </CardContent>
        <CardFooter>
          <button>Save Changes</button>
        </CardFooter>
      </Card>
    );
    const headerElement = screen.getByText('RSS Feed Manager');
    const footerElement = screen.getByText('Save Changes');
    const bodyElement = screen.queryByText('Add, Select or Delete feeds');

    expect(headerElement).toBeInTheDocument();
    expect(footerElement).toBeInTheDocument();
    expect(bodyElement).not.toBeInTheDocument();
  });
});
