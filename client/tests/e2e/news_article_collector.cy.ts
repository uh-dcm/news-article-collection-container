describe('News Article Collector App', () => {
  const downloadsFolder: string = Cypress.config('downloadsFolder');

  beforeEach(() => {
    cy.visit('/');

    cy.wait(1000);

    cy.intercept('POST', '/api/register').as('registerRequest');

    // First, handle registration if on the registration screen
    cy.get('body').then((body) => {
      if (body.find('button:contains("Register")').length > 0) {
        // Write text to email input
        cy.get('input[type="email"]').type('testi@testi.fi');
        cy.get('input[type="password"]').type('testi');

        cy.wait(500);

        // Click the register button
        cy.contains('Register').click();

        cy.wait('@registerRequest');

        // Add a wait to allow any redirection or confirmation messages to process
        cy.wait(500);
      }
    });

    cy.wait(200);

    cy.intercept('POST', '/api/login').as('loginRequest');

    // Next, handle login whether coming from the registration process or directly at login
    cy.get('body').then((body) => {
      if (body.find('button:contains("Log in")').length > 0) {
        cy.get('input[type="password"]').type('testi');

        cy.get('button').contains('Log in').click()
        cy.wait('@loginRequest')
        cy.wait(500);
      }
    });

    cy.url().should('not.include', '/login', { timeout: 10000 })  // Ensure logged in
  });

  after(() => {
    cy.task('clearDownloads');
  });

  it('should load the app', () => {
    cy.wait(1000);

    cy.contains('News Article Collector', { timeout: 3000 }).should(
      'exist'
    );
  });

  // Yle permits data mining for scientific purposes.
  // https://yle.fi/aihe/s/10004373
  // Replace the url if they change it to v2.

    // Add a new feed URL
    it('should add an RSS feed URL to the list', () => {
      cy.wait(1000);
  
      cy.get('input[placeholder="Input RSS feed address here..."]').type(
        'https://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss'
      );
      cy.contains('Add to list', { timeout: 3000 }).click();
      cy.contains(
        'https://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss',
        { timeout: 3000 }
      ).should('be.visible');
  
      cy.contains('Feed list updated successfully!', { timeout: 3000 }).should(
        'be.visible'
      );
    });
    // New: Remove the feed URL
    it('should remove an RSS feed URL from the list', () => {
      cy.wait(1000);
  
      // Add a feed URL first
      cy.get('input[placeholder="RSS feed address here..."]').type(
        'https://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss'
      );
      cy.contains('Add to list', { timeout: 3000 }).click();
      cy.contains(
        'https://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss',
        { timeout: 3000 }
      ).should('exist');

      // Then remove the feed URL
      cy.contains('Remove', { timeout: 3000 }).click();
      cy.contains(
        'https://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss',
        { timeout: 3000 }
      ).should('not.exist');
  
      cy.contains('Feed list updated successfully!', { timeout: 3000 }).should(
        'be.visible'
      );
    });
  
    it('should handle invalid RSS feed URL', () => {
      cy.wait(1000);
  
      cy.get('input[placeholder="RSS feed address here..."]').type('invalid-url');
      cy.contains('Add to list', { timeout: 3000 }).click();
  
      cy.contains('Invalid RSS feed URL!', { timeout: 3000 }).should('be.visible');
    });

    // New
    it('should handle download error', () => {
      cy.wait(1000);
  
      // Simulate a download error
      cy.intercept('GET', '/api/download/json', {
        statusCode: 500,
        body: { message: 'Download failed' },
      });
  
      cy.contains('Download JSON', { timeout: 3000 }).click();
  
      cy.contains('Download failed', { timeout: 3000 }).should('be.visible');
    });
  
    // Note: the rest can take over 2 minutes.

    it('should start RSS fetching', () => {
      cy.wait(1000);
  
      cy.get('[id=toggleFetching]', { timeout: 3000 }).click({
        force: true,
      });
      cy.contains('RSS fetching in progress', { timeout: 3000 }).should(
        'be.visible'
      );
      cy.contains('Gathering articles...', { timeout: 3000 }).should(
        'be.visible'
      );
    });
  
    // New: Ensure the system handles stopping RSS fetching correctly.
    it('should stop RSS fetching', () => {
      cy.wait(1000);
  
      cy.get('[id=toggleFetching]', { timeout: 3000 }).click({
        force: true,
      });
      cy.contains('RSS fetching stopped', { timeout: 3000 }).should(
        'be.visible'
      );
    });

    // Download file in different formats tests
    
    it('should download filled articles.json', () => {
      cy.wait(1000);
  
      cy.get('button').contains('JSON', { timeout: 3000 }).click({ force: true });
      cy.wait(500);


      cy.contains('Downloading...', { timeout: 3000 }).should('exist');
      cy.contains('Please note that the process might take some time.', {
        timeout: 3000,
      }).should('exist');
  
      cy.wait(1000);
  
      cy.readFile(`${downloadsFolder}/articles.json`, { timeout: 300000 })
        .should('exist')
        .then((articles: unknown) => {
          expect(articles).to.be.an('array');
          expect((articles as unknown[]).length).to.be.greaterThan(0);
        });
    });
  
    it('should download filled articles.csv', () => {
      cy.wait(1000);
      cy.get('button').contains('CSV', { timeout: 3000 }).click({ force: true });
  
      cy.wait(3000);
      cy.contains('Download successful!', { timeout: 3000 }).should(
        'be.visible',
        { timeout: 3000 }
      );
  
      cy.readFile(`${downloadsFolder}/articles.csv`, 'utf-8')
        .should('exist')
        .then((content: string) => {
          const rows = content.split('\n');
          expect(rows.length).to.be.greaterThan(1);
  
          // remove the double quotes
          const headers = rows[0].replace(/"/g, '').split(',');
          expect(headers).to.include.members([
            'id',
            'url',
            'html',
            'full_text',
            'time',
            'download_time',
          ]);
        });
    });
  
    
  // Parquet seems to require specific import reader.
  it('should download articles.parquet', () => {
    cy.wait(1000);
    cy.get('button').contains('Download All Articles').click({ force: true });
  
    cy.wait(500);
    cy.contains('Parquet', { timeout: 3000 }).click({ force: true });

    cy.wait(1000);
    cy.contains('Download successful!', { timeout: 10000 }).should(
      'be.visible',
      { timeout: 3000 }
    );
    cy.readFile(`${downloadsFolder}/articles.parquet`, { timeout: 10000 })
      .should('exist');
  });


  it('should go to search, click search and get fetched articles', () => {
    cy.wait(1000);

    cy.contains('Search', { timeout: 3000 }).click();

    cy.wait(1000);

    cy.get('button:contains("Search")')
      .find('svg')
      .should('have.class', 'mr-2 h-4 w-4')
      .click({ force: true });

    cy.wait(1000);

    cy.document().then((doc) => {
      const yleCount = (doc.body.innerText.match(/yle/gi) || []).length;
      expect(yleCount).to.be.greaterThan(5);
    });
  });

    // New: Empty search results.
    it('should handle no articles found during search', () => {
      cy.wait(1000);
  
      cy.contains('Search', { timeout: 3000 }).click();
  
      cy.wait(1000);
  
      cy.get('input[placeholder="Insert text query..."]').type('Nonexistent text');
      cy.get('button:contains("Search")').click();
  
      cy.contains('No articles found', { timeout: 3000 }).should('be.visible');
    });
  });
