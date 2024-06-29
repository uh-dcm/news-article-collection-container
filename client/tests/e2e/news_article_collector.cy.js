describe('News Article Collector App', () => {
  const downloadsFolder = Cypress.config('downloadsFolder');

  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the app', () => {
    cy.contains('News article collector').should('be.visible');
  });

  // Yle permits data mining for scientific purposes.
  // https://yle.fi/aihe/s/10004373
  // Replace the url if they change it to v2

  it('should add an RSS feed URL to the list', () => {
    cy.get('input[placeholder="RSS-feed address here..."]').type('https://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss');
    cy.contains('Add to list').click();
    cy.contains('https://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss').should('be.visible');
  });

  it('should submit RSS feed URLs', () => {
    cy.get('input[placeholder="RSS-feed address here..."]').type('https://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss');
    cy.contains('Add to list').click();
    cy.contains('https://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss').should('be.visible');
    cy.contains('Send selected RSS feeds').click();
    cy.contains('Feed list set successfully!').should('be.visible');
  });

  // The rest can take over 2 minutes with the original collect.py and process.py.
  // With the improved ones it takes roughly 15 seconds.

  it('should start RSS fetching', () => {
    cy.contains('Activate RSS fetching').click({ force: true });
    cy.contains('RSS fetching in progress').should('be.visible');
    cy.contains('Gathering articles...').should('be.visible');
  });

  it('should download filled articles.json', () => {
    cy.get('button').contains('JSON').click({ force: true });

    cy.readFile(`${downloadsFolder}/articles.json`, { timeout: 300000 }).should('exist').then((articles) => {
      expect(articles).to.be.an('array');
      expect(articles.length).to.be.greaterThan(0);
    });
  });

  it('should download filled articles.csv', () => {
    cy.wait(1000);
    cy.get('button').contains('CSV').click({ force: true });

    cy.readFile(`${downloadsFolder}/articles.csv`, 'utf-8').should('exist').then((content) => {
      const rows = content.split('\n');
      expect(rows.length).to.be.greaterThan(1);

      // remove the double quotes
      const headers = rows[0].replace(/"/g, '').split(',');
      expect(headers).to.include.members(['id', 'url', 'html', 'full_text', 'time', 'download_time']);
    });
  });

  // parquet seems to require specific import reader
});
