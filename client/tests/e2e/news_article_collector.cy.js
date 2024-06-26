describe('News Article Collector App', () => {
  //const downloadsFolder = Cypress.config('downloadsFolder');

  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the app', () => {
    cy.contains('News article collector').should('be.visible');
  });

  it('should add an RSS feed URL to the list', () => {
    cy.get('input[placeholder="RSS-feed address here..."]').type('https://www.androidauthority.com/feed/');
    cy.contains('Add to list').click();
    cy.contains('https://www.androidauthority.com/feed/').should('be.visible');
  });

  it('should submit RSS feed URLs', () => {
    cy.get('input[placeholder="RSS-feed address here..."]').type('https://www.androidauthority.com/feed/');
    cy.contains('Add to list').click();
    cy.contains('https://www.androidauthority.com/feed/').should('be.visible');
    cy.contains('Send selected RSS feeds').click();
    cy.contains('Feed list set successfully!').should('be.visible');
  });

  //it('should start RSS fetching', () => {
  //  cy.contains('Activate RSS fetching').click({ force: true });
  //  cy.contains('RSS fetching in progress').should('be.visible');
  //  cy.contains('Gathering articles...').should('be.visible');
  //});

  //it('should download filled articles.json', () => {
  //  cy.contains('Download articles').click({ force: true });

  //  cy.readFile(`${downloadsFolder}/articles.json`, { timeout: 60000 }).should('exist').then((articles) => {
  //    expect(articles).to.be.an('array');
  //    expect(articles.length).to.be.greaterThan(0);
  //  });
  //});
});
