const o = "object";
const h = "HTML";
const s = "string";
const a = "array";
const A = "ARRAY+";
const n = "number";
const b = "boolean";
const N = "null";
const u = "undefined";
const S = "symbol";
const F = "arrow fn";
const f = "function";
const c1a = "customType1a";
const c1b = "customType1b";
const c2 = "customType2";
const c3 = "customType3";
const customStoreValue_row = 22;
const customStoreValue_end_row = 28;
const example_urls = ["/CustomElementES", "/CustomElementIIFE", "/SvelteComponent"];

module.exports = (index) => {
    const url = example_urls[index];
    describe(url + ": " + "Toggle Main panel", function () {
        it("Panel is visible", function () {
            setViewportAndVisitUrl(url);
            cy.get("div.tree");
        });

        it("Hide button is visible", function () {
            cy.get("div.toggle.toggleShow");
        });

        it("Clicking hide button, hides panel", function () {
            cy.get("div.toggle.toggleShow").click();
            cy.get("div.toggle.toggleHide");
            cy.get("div.tree").should("not.exist");
        });

        it("Show button is visible", function () {
            cy.get("div.toggle.toggleHide");
        });

        it("Clicking show button, shows panel", function () {
            cy.get("div.toggle.toggleHide").click();
            cy.wait(500);
            cy.get("div.tree");
        });
    });

    describe(url + ": " + "Toggle panel objects", function () {
        const rows = 27;
        const multiline_rows = 9;
        const all = rows + multiline_rows;
        it(`Count of data rows should be ${all} (${rows} rows + ${multiline_rows} multilines)`, function () {
            setViewportAndVisitUrl(url);
            cy.get("div.row").should("have.length", all);
            nthSelectorEqualsText(0, "span.len", "(" + rows + ")");
        });

        it("List of child types should match test data", function () {
            const types = [o, h, s, s, a, a, A, o, n, n, b, b, N, u, S, S, F, F, f, o, n, o, n, c1a, c1b, c2, c3];
            for (let i = 0; i < types.length; i++) {
                nthSelectorEqualsText(i, "span.type", types[i]);
            }
        });

        const html_row = 1;
        const child_rows = 12;
        it(`Clicking first sub-item 'HTML' expand arrow, should expand item, showing ${child_rows} children of correct type`, function () {
            cy.get("button.pause").click();
            cy.get("span.dataArrow").eq(1).click();
            nthSelectorEqualsText(html_row, "span.len", "(12)");
            nthSelectorEqualsText(html_row, "span.type", "HTML");

            for (let i = html_row + 1; i < child_rows; i++) {
                nthSelectorEqualsText(i, "span.type", h);
            }
        });
    });

    describe(url + ": " + "Prop options", function () {
        describe(url + ": " + "Open", function () {
            const longstring_row = 3;
            const longstring_row_2nd_position = 15;
            it("Open = null, No panels are open", function () {
                setViewportAndVisitUrl(url);
                cy.wait(1000);
                //item 'longstring' with no panels open above it, should be in original position
                nthSelectorEqualsText(longstring_row, "div.row span.key", "longstring");
            });

            it("Open = 'string1', is not an object or array so no panels are open", function () {
                setViewportAndVisitUrl(url + "?open=string1");

                cy.wait(1000);
                //item 'longstring' with no panels open above it, should be in original position
                nthSelectorEqualsText(longstring_row, "div.row span.key", "longstring");
            });

            it("Open = 'bananaman', is not a valid reference so no panels are open", function () {
                setViewportAndVisitUrl(url + "?open=bananaman");

                cy.wait(1000);
                //item 'longstring' with no panels open above it, should be in original position
                nthSelectorEqualsText(longstring_row, "div.row span.key", "longstring");
            });

            it("Open = 'html', is an object, so it is open, so longstring is further down", function () {
                setViewportAndVisitUrl(url + "?open=html");

                cy.wait(1000);
                //item 'longstring' after expanded 'html' should be further down
                nthSelectorEqualsText(longstring_row_2nd_position, "div.row span.key", "longstring");
            });
        });

        describe(url + ": " + "Fade", function () {
            describe(url + ": " + "Fade = true", function () {
                it("Panel is visible with 0.3 opacity when NOT mouseover", function () {
                    setViewportAndVisitUrl(url + "?fade=true");

                    cy.get("div.tree").should("have.css", "opacity", "0.3");
                });

                it("Panel is visible with 1 opacity when mouseover (simulates a hover)", function () {
                    setViewportAndVisitUrl(url + "?fade=true");

                    cy.get("#svelteObjectExplorer").trigger("mouseover").wait(1000).should("have.css", "opacity", "1");
                });
            });

            describe(url + ": " + "Fade = false", function () {
                it("Panel is visible with 1 opacity when NOT mouseover", function () {
                    setViewportAndVisitUrl(url);
                    cy.get("div.tree").should("have.css", "opacity", "1");
                });

                it("Panel is visible with 1 opacity when mouseover (simulates a hover)", function () {
                    setViewportAndVisitUrl(url);
                    cy.get("#svelteObjectExplorer").trigger("mouseover").wait(1000).should("have.css", "opacity", "1");
                });
            });
        });

        describe(url + ": " + "tabposition", function () {
            it("The 'Show' Panel is in the top, because of prop 'tabposition=top'", function () {
                setViewportAndVisitUrl(url + "?tabposition=top");

                cy.get("div.toggle.toggleShow.toggletop");
            });
            it("The 'Show' Panel is in the middle, because of prop 'tabposition=middle'", function () {
                setViewportAndVisitUrl(url + "?tabposition=middle");

                cy.get("div.toggle.toggleShow.togglemiddle");
            });
            it("The 'Show' Panel is in the bottom, because of prop 'tabposition=bottom'", function () {
                setViewportAndVisitUrl(url + "?tabposition=bottom");

                cy.get("div.toggle.toggleShow.togglebottom");
            });
        });

        describe(url + ": " + "rateLimit", function () {
            let rate = 100;
            describe(`${url}: rateLimit = default ${rate}. Autocounter should increase cache automatically each second`, function () {
                callAutomaticCounterTests(url, rate, 50, 1100, "not.");
            });
            rate = 500;
            describe(`${url}: rateLimit = default ${rate}. Autocounter should still increase cache each second`, function () {
                callAutomaticCounterTests(url, rate, 250, 1100, "");
            });
            rate = 2000;
            describe(`${url}: rateLimit = default ${rate}. Autocounter should increase cache automatically each 2 seconds`, function () {
                callAutomaticCounterTests(url, rate, 500, 3000, "");
            });
        });
    });

    describe(url + ": " + "Panel data updates when App data updates", function () {
        describe("Manual: Clicking counter buttons should change the manual counter", function () {
            it("customStoreValue is initially set to 0", function () {
                setViewportAndVisitUrl(url);
                cy.wait(1000);
                nthSelectorEqualsText(customStoreValue_row, "div.row span.key", "customStoreValue");
                nthSelectorEqualsText(customStoreValue_end_row, "div.row span.val", "0"); // 22 + 6 multi-lines from longstring
            });

            it("click increase button twice, should equal 2", function () {
                cy.get("#incr").click();
                cy.get("#incr").click();
                cy.wait(1000);
                nthSelectorEqualsText(customStoreValue_end_row, "div.row span.val", "2");
            });

            it("click decrease button once, should equal 1", function () {
                cy.get("#decr").click();
                cy.wait(1000);
                nthSelectorEqualsText(customStoreValue_end_row, "div.row span.val", "1");
            });

            it("click reset button once, should equal 0 again", function () {
                cy.get("#reset").click();
                cy.wait(1000);
                nthSelectorEqualsText(customStoreValue_end_row, "div.row span.val", "0");
            });
        });

        describe(url + ": " + "Automatic: Data updates when paused and un-paused, compared to view", function () {
            it("data and view are the same on page load", function () {
                setViewportAndVisitUrl(url);
                cy.wait(2000);
                cy.get(".reset").click();
                cy.get("span.cache_view")
                    .invoke("text")
                    .then((count1) => {
                        nthSelectorEqualsText(0, "span.cache_data", count1);
                        nthSelectorEqualsText(0, "span.cache_view", count1);
                    });
            });
            it("after 2 seconds of pausing, data has increased, but view should not", function () {
                setViewportAndVisitUrl(url);
                cy.wait(1000);
                //pause
                cy.get(".reset").click();
                cy.get("button.pause").click();
                cy.get("span.cache_data")
                    .invoke("text")
                    .then((count1) => {
                        cy.wait(2000);
                        cy.get("span.cache_data")
                            .invoke("text")
                            .then((count2) => {
                                expect(Number.parseInt(count2)).to.be.greaterThan(Number.parseInt(count1));
                            });
                    });
                cy.get("span.cache_view")
                    .invoke("text")
                    .then((count1) => {
                        cy.wait(2000);
                        cy.get("span.cache_view")
                            .invoke("text")
                            .then((count2) => {
                                expect(Number.parseInt(count2)).to.be.equal(Number.parseInt(count1));
                            });
                    });
            });
            it("both data and view will update after unpause", function () {
                setViewportAndVisitUrl(url);
                cy.wait(1000);
                //pause
                cy.get(".reset").click();
                cy.get("button.pause").click();
                cy.get("span.cache_data")
                    .invoke("text")
                    .then((count1) => {
                        cy.wait(2000);
                        //this unpause should also affect the view in block below
                        cy.get("button.pause").click();
                        cy.wait(2000);
                        cy.get("span.cache_data")
                            .invoke("text")
                            .then((count2) => {
                                expect(Number.parseInt(count2)).to.be.greaterThan(Number.parseInt(count1));
                            });
                    });
                cy.get("span.cache_view")
                    .invoke("text")
                    .then((count1) => {
                        cy.wait(4000);
                        cy.get("span.cache_view")
                            .invoke("text")
                            .then((count2) => {
                                expect(Number.parseInt(count2)).to.be.greaterThan(Number.parseInt(count1));
                            });
                    });
            });
        });
    });

    describe(url + ": " + "Using SvelteValue to expand deep dom elements", function () {
        describe("No expansion if SvelteValue is not used", function () {
            it("should have 5 rows of data to start with", function () {
                setViewportAndVisitUrl(url + "/Expander/Example1");

                cy.get("div.row").should("have.length", 5);
            });

            it("should show unexpanded top level div", function () {
                nthSelectorEqualsText(3, "span.val", "<div></div>");
            });

            it("can expand all nested divs, to reveal expected content", function () {
                cy.get("span.dataArrow").eq(1).click();
                cy.get("span.dataArrow").eq(2).click();
                cy.get("span.dataArrow").eq(3).click();
                cy.get("span.dataArrow").eq(4).click();
                cy.get("span.dataArrow").eq(5).click();
                cy.get("span.dataArrow").eq(6).click();
                nthSelectorEqualsText(9, "span.val", "Deeply Nested Content");
            });
        });

        describe.only("Auto-expansion if SvelteValue is used", function () {
            const expander1_row = 9;
            const expander2_row = 21;
            const expander3_row = 35;
            const expander3_child_arrow = 20;
            const expander4_child_arrow = 27;

            //below are true after above have been expanded
            const expander4_row = 51;
            const rows = 64;

            it(`has ${rows} rows of data to start with`, function () {
                setViewportAndVisitUrl(url + "/Expander/Example2");
                cy.get("span.dataArrow").eq(expander3_child_arrow).click();
                cy.get("span.dataArrow").eq(expander4_child_arrow).click();
                cy.get("div.row").should("have.length", rows);
            });

            describe("SvelteValue - no attributes", function () {
                it("displays unexpanded", function () {
                    nthSelectorEqualsText(
                        expander1_row,
                        "span.val",
                        "<svelte-explorer-expand></svelte-explorer-expand>"
                    );
                });

                it("displays adjacent content", function () {
                    nthSelectorEqualsText(expander1_row + 1, "span.val", "Deeply Nested Content 1");
                });
            });

            describe("SvelteValue - value='testy'", function () {
                it("displays expanded first row", function () {
                    nthSelectorEqualsText(expander2_row, "span.val", "<svelte-explorer-expand>");
                });
                it("displays value", function () {
                    nthSelectorEqualsText(expander2_row + 1, "span.val", "testy");
                });
                it("displays expanded last row", function () {
                    nthSelectorEqualsText(expander2_row + 2, "span.val", "</svelte-explorer-expand>");
                });
                it("displays adjacent content", function () {
                    nthSelectorEqualsText(expander2_row + 3, "span.val", "Deeply Nested Content 2");
                });
            });

            describe("SvelteValue - name='test' value={{ testy: 'testy' }}", function () {
                it("displays expanded first row", function () {
                    nthSelectorEqualsText(expander3_row, "span.val", "<svelte-explorer-expand>");
                });
                it("displays value", function () {
                    nthSelectorEqualsText(expander3_row + 1, "span.val", "{");
                    nthSelectorEqualsText(expander3_row + 2, "span.val", "testy");
                    nthSelectorEqualsText(expander3_row + 3, "span.val", "}");
                });
                it("displays expanded last row", function () {
                    nthSelectorEqualsText(expander3_row + 4, "span.val", "</svelte-explorer-expand>");
                });
                it("displays adjacent content", function () {
                    nthSelectorEqualsText(expander3_row + 5, "span.val", "Deeply Nested Content 3");
                });
            });

            describe("SvelteValue - value={{ testy: 'testy' }} name='test' other-attr='test'", function () {
                it("displays expanded first row", function () {
                    nthSelectorEqualsText(expander4_row, "span.val", "<svelte-explorer-expand>");
                });
                it("displays value", function () {
                    nthSelectorEqualsText(expander4_row + 1, "span.val", "{");
                    nthSelectorEqualsText(expander4_row + 2, "span.val", "testy");
                    nthSelectorEqualsText(expander4_row + 3, "span.val", "}");
                });
                it("displays expanded last row", function () {
                    nthSelectorEqualsText(expander4_row + 4, "span.val", "</svelte-explorer-expand>");
                });
                it("displays adjacent content", function () {
                    nthSelectorEqualsText(expander4_row + 5, "span.val", "Deeply Nested Content 4");
                });
            });
        });
    });
};

function callAutomaticCounterTests(url, rate, before, after, not) {
    const full_url = rate === 100 ? url : url + "?rateLimit=" + rate;
    it(`data before rate:${rate} is same`, function () {
        testAutomaticCounter(full_url, "span.cache_data", before, false, not);
    });
    it(`view before rate:${rate} is same`, function () {
        testAutomaticCounter(full_url, "span.cache_view", before, false, not);
    });
    it(`data after rate:${rate} is different`, function () {
        testAutomaticCounter(full_url, "span.cache_data", after, true, not);
    });
    it(`view after rate:${rate} is different`, function () {
        testAutomaticCounter(full_url, "span.cache_view", after, true, not);
    });
}

function testAutomaticCounter(url, selector, wait, should_be_greater, not_visible = "") {
    setViewportAndVisitUrl(url);
    cy.wait(2000);
    cy.get(".reset").click();
    cy.get(selector)
        .invoke("text")
        .then((count1) => {
            //wait then get same value, it should be greater(or equal)
            cy.wait(wait);
            cy.get(selector)
                .invoke("text")
                .then((count2) => {
                    if (should_be_greater) expect(Number.parseInt(count2)).to.be.greaterThan(Number.parseInt(count1));
                    else expect(count2).to.be.equal(count1);

                    if (not_visible) cy.get("span.cache_ratelimit").should("not.exist");
                    else cy.get("span.cache_ratelimit");
                });
        });
}

function nthSelectorEqualsText(n, selector, compare_text) {
    cy.get(selector)
        .eq(n)
        .invoke("text")
        .then((text) => {
            expect(text).to.equal(compare_text);
        });
}

function setViewportAndVisitUrl(url) {
    cy.viewport(1000, 600);
    cy.visit(url);
}
