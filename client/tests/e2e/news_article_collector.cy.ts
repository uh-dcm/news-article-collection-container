describe('News Article Collector App', () => {
  const downloadsFolder: string = Cypress.config('downloadsFolder');

  beforeEach(() => {
    cy.visit('/');

    cy.wait(1000);

    // First, handle registration if on the registration screen
    cy.get('body').then((body) => {
      if (body.find('button:contains("Register")').length > 0) {
        // Write text to email input
        cy.get('input[type="email"]').type('testi@testi.fi');
        cy.get('input[type="password"]').type('testi');

        cy.wait(500);

        // Click the register button
        cy.contains('Register').click();

        // Add a wait to allow any redirection or confirmation messages to process
        cy.wait(500);
      }
    });

    cy.wait(200);

    // Next, handle login whether coming from the registration process or directly at login
    cy.get('body').then((body) => {
      if (body.find('button:contains("Log in")').length > 0) {
        cy.get('input[type="password"]').type('testi');

        cy.contains('Log in').click();
        cy.wait(500);
      }
    });

    // when it comes to checking non-toast text, exist check is preferable
    cy.contains('RSS feeds', { timeout: 10000 }).should('exist'); // Ensure logged in
  });

  after(() => {
    cy.task('clearDownloads');
  });

  it('should load the app', () => {
    cy.wait(1000);

    cy.contains('Add or delete feeds', { timeout: 3000 }).should(
      'exist'
    );
  });

  // Yle permits data mining for scientific purposes.
  // https://yle.fi/aihe/s/10004373
  // Replace the url if they change it to v2.

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

  it('should download filled articles.json', () => {
    cy.wait(1000);
    cy.get('button').contains('Download All Articles').click({ force: true });

    cy.wait(500);
    cy.contains('JSON', { timeout: 3000 }).click({ force: true });

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
    cy.get('button').contains('Download All Articles').click({ force: true });

    cy.wait(500);
    cy.contains('CSV', { timeout: 3000 }).click({ force: true });

    cy.wait(1000);
    cy.contains('Download successful!', { timeout: 10000 }).should(
      'be.visible',
      { timeout: 3000 }
    );

    cy.readFile(`${downloadsFolder}/articles.csv`, 'utf-8', { timeout: 10000 })
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
});
