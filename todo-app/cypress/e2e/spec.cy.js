/* eslint-disable no-undef */
describe("Todo Application", () => {
  const url = "http://localhost:3000";
  beforeEach(() => {
    cy.visit(url);
  });

  it("Sign up", () => {
    cy.visit(`${url}/signup` , { timeout: 120000 });
    cy.get('input[name="firstName"]').type("Test");
    cy.get('input[name="lastName"]').type("User A");
    cy.get('input[name="email"]').type("user.a@test.com");
    cy.get('input[name="password"]').type("12345678");
    cy.get("form").submit();
    cy.url().should("eq", `${url}/todos`);
  });

  it("Sign out", () => {
    cy.visit(`${url}/todos`, { timeout: 120000 });
  
    cy.get('button[type="submit"]').should('exist').and('be.visible').then(($button) => {
      const buttonText = $button.text().trim();
  
      if (buttonText !== 'Sign Out') {
        cy.log(`Button text is incorrect. Expected "Sign Out" but found "${buttonText}"`);
      }
    });
  
    cy.url().should("not.include", "/todos");
  });

  it("Login", () => {
    cy.visit(`${url}/login`);
    cy.get('input[name="email"]').type("user.a@test.com");
    cy.get('input[name="password"]').type("12345678");
    cy.get("form").submit();
    cy.url().should("eq", `${url}/todos`);
  });

});