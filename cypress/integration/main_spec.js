describe("Toggle Main panel", function() {
    it("Panel is visible", function() {
        cy.viewport(1000, 600);
        cy.visit("http://localhost:5000/");
        cy.get("div.tree");
    });

    it("Hide button is visible", function() {
        cy.get("div.toggle.toggleShow");
    });

    it("Clicking hide button, hides panel", function() {
        cy.get("div.toggle.toggleShow").click();
        cy.get("div.tree.tree-hide");
    });

    it("Show button is visible", function() {
        cy.get("div.toggle.toggleHide");
    });

    it("Clicking show button, hides panel", function() {
        cy.get("div.toggle.toggleHide").click();
        cy.get("div.tree.tree-hide").should("not.be.visible");
    });
});

describe("Toggle data objects", function() {
    it("Count of items should be 2", function() {
        cy.viewport(1000, 600);
        cy.visit("http://localhost:5000/");
        cy.get("td.link").should("have.length", 2);
    });

    it("Count of expanded values should be 0", function() {
        cy.get("td.treeVal").should("have.length", 0);
    });

    it("Clicking first item, should show first expanded value (2 treeVal classes) with Array (9)", function() {
        cy.get("td.link")
            .first()
            .click();
        cy.get("td.treeVal").should("have.length", 2);
        cy.get("td.treeVal").contains("Array");
        cy.get("td.treeVal").contains("(9)");
    });

    it("Clicking second item, should show second expanded value (2 treeVal classes) with Array (5)", function() {
        cy.get("td.link")
            .last()
            .click();
        cy.get("td.treeVal").should("have.length", 2);
        cy.get("td.treeVal").contains("Array");
        cy.get("td.treeVal").contains("(5)");
    });
});
