describe('News Article Collector App', () => {
  const downloadsFolder: string = Cypress.config('downloadsFolder');

  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the app', () => {
    cy.wait(1000);

    cy.contains('News article collector', { timeout: 3000 }).should(
      'be.visible'
    );
  });

  // Yle permits data mining for scientific purposes.
  // https://yle.fi/aihe/s/10004373
  // Replace the url if they change it to v2.

  it('should add an RSS feed URL to the list', () => {
    cy.wait(1000);

    cy.get('input[placeholder="RSS-feed address here..."]').type(
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

    cy.contains('Activate RSS fetching', { timeout: 3000 }).click({
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

    cy.get('button').contains('JSON', { timeout: 3000 }).click({ force: true });

    cy.contains('Downloading...', { timeout: 3000 }).should('exist');
    cy.contains('Please note that the process might take some time.', {
      timeout: 3000,
    }).should('exist');

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
});
