describe('News Article Collector App', () => {
  it('should load the app', () => {
    cy.visit('http://localhost:4000');
    cy.contains('News article collector').should('be.visible');
  });

  // it('should download articles', () => {
  //   cy.visit('http://localhost:4000');
    
  //   cy.contains('Download articles').click();
    
    //2 seconds
  //   cy.wait(2000);
    
  //   const downloadsFolder = Cypress.config('downloadsFolder');
  //   cy.readFile(`${downloadsFolder}/articles.json`).should('exist');
  // });
});
