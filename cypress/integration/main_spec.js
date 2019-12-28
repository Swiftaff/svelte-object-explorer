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

    it("Clicking show button, shows panel", function() {
        cy.get("div.toggle.toggleHide").click();
        cy.get("div.tree.tree-hide").should("not.be.visible");
    });

    it("Show Panel is in the middle, because of prop 'tabPosition=middle'", function() {
        cy.get("div.toggle.toggleShow.togglemiddle");
    });
});

describe("Fade functionality", function() {
    it("Panel is visible with 0.3 opacity when NOT hovered by mouse", function() {
        cy.viewport(1000, 600);
        cy.visit("http://localhost:5000/");
        cy.get("div.tree").should("have.css", "opacity", "0.3");
    });

    it("Panel is visible with 1 opacity when HOVERED by mouse", function() {
        cy.viewport(1000, 600);
        cy.visit("http://localhost:5000/");
        cy.get("#svelteObjectExplorer")
            .trigger("mouseover")
            .wait(1000)
            .should("have.css", "opacity", "1");
    });
});

describe("Toggle panel objects", function() {
    it("Count of top level test objects should match test data of 4 items", function() {
        cy.viewport(1000, 600);
        cy.visit("http://localhost:5000/");
        cy.get("td.link").should("have.length", 4);
    });

    it("Third test object should be open due to 'open' prop being set to 'variousTypes', showing 12 subitems", function() {
        cy.get("div.row").should("have.length", 12);
    });

    it("Clicking first item, should show first expanded item as an Object (4), showing 6 rows (4 plus first and last)", function() {
        cy.get("td.link")
            .first()
            .click();
        cy.get("div.row").should("have.length", 6);
        cy.get("td.treeVal").contains("Object");
        cy.get("td.treeVal").contains("(4)");
    });
});

describe("Panel data updates when App data updates", function() {
    it("Automatic: autocounter should increase automatically (but also waits, to allow for rateLimit prop of 2 seconds)", function() {
        cy.viewport(1000, 600);
        cy.visit("http://localhost:5000/");
        //get value
        cy.get("td.link")
            .eq(2)
            .invoke("text")
            .then(count1 => {
                //wait a bit then get same value, it should be the same since rateLimit is in place
                cy.wait(100);
                cy.get("td.link")
                    .eq(2)
                    .invoke("text")
                    .then(count2 => {
                        expect(Number.parseInt(count2)).to.be.equal(Number.parseInt(count1));

                        //wait a bit more get same value, it should be greater
                        cy.wait(5000);
                        cy.get("td.link")
                            .eq(2)
                            .invoke("text")
                            .then(count3 => {
                                expect(Number.parseInt(count3)).to.be.greaterThan(Number.parseInt(count1));
                            });
                    });
            });
    });
    it("Manual: Clicking counter buttons should change the manual counter (but also waits, to allow for rateLimit prop of 2 seconds)", function() {
        cy.viewport(1000, 600);
        cy.visit("http://localhost:5000/");
        //initially set to 0
        cy.get("td.link")
            .eq(1)
            .invoke("text")
            .then(count1 => {
                expect(Number.parseInt(count1)).to.equal(0);
            });

        //click increase button twice, should equal 2
        cy.get("#incr").click();
        cy.get("#incr").click();
        cy.wait(5000);
        cy.get("td.link")
            .eq(1)
            .invoke("text")
            .then(count1 => {
                expect(Number.parseInt(count1)).to.equal(2);
            });

        //click decrease button once, should equal 1
        cy.get("#decr").click();
        cy.wait(5000);
        cy.get("td.link")
            .eq(1)
            .invoke("text")
            .then(count1 => {
                expect(Number.parseInt(count1)).to.equal(1);
            });

        //click reset button once, should equal 0 again
        cy.get("#decr").click();
        cy.wait(5000);
        cy.get("td.link")
            .eq(1)
            .invoke("text")
            .then(count1 => {
                expect(Number.parseInt(count1)).to.equal(0);
            });
    });
});
