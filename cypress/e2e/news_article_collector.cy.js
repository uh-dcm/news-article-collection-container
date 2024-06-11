describe('News Article Collector App', () => {
  it('should load the app', () => {
    cy.visit('http://localhost:4000');
    cy.contains('News article collector').should('be.visible');
  });

  //it('should set feed URLs', () => {
  //  cy.visit('http://localhost:4000');
  //  cy.get('textarea').type('https://www.androidauthority.com/feed/');
  //  cy.contains('Set RSS feed list').click();
  //  cy.contains('Success').should('be.visible');
  //});
});
