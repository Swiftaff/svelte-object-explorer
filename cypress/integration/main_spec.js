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
const VIEWPORT_WIDTH = 1000;
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
            nthSelectorClick(1, "span.dataArrow");
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

    describe(url + ": " + "Adjust panel width", function () {
        describe("Mousedown/mouseup on edge, will toggle the transition of the toggle button", function () {
            it("toggle has transition on page load", function () {
                setViewportAndVisitUrl(url + "/Expander/Example1");
                cy.get(".toggle").then((el) => {
                    expect(el[0].style.transitionDuration).to.equal("0.2s");
                });
            });

            it("Mousedown on edge removes transition from toggle", function () {
                cy.get(".width_adjust_hover_zone")
                    .trigger("mousedown")
                    .then((el) => {
                        cy.get(".toggle").then((el) => {
                            expect(el[0].style.transitionDuration).to.equal("");
                        });
                    });
            });

            it("Mouseup returns transition to toggle", function () {
                cy.get(".width_adjust_hover_zone")
                    .click() // doing this instead of mouseup which isn't working
                    .then((el) => {
                        cy.get(".toggle").then((el) => {
                            expect(el[0].style.transitionDuration).to.equal("0.2s");
                        });
                    });
            });
        });

        describe("Dragging left and right, changes width, saves to localStorage", function () {
            it("Drag edge to the left, will increase panel width", function () {
                setViewportAndVisitUrl(url + "/Expander/Example1");
                let first, second, clientX;

                //mousedown on edge, get position
                cy.get(".width_adjust_hover_zone")
                    .click()
                    .trigger("mousedown")
                    .then((el) => {
                        first = getStyleLeftValue(el);
                        clientX = first - 100;
                    });

                // move mouse to the left
                cy.window().then((win) => {
                    win.dispatchEvent(new win.MouseEvent("mousemove", { clientX, clientY: 0 }));
                    win.dispatchEvent(new win.MouseEvent("mouseup", { clientX, clientY: 0 }));
                });

                //mouseup, get position again, mouseup compare
                cy.get(".width_adjust_hover_zone")
                    .click() // doing this instead of mouseup which isn't working
                    .then((el3) => {
                        second = getStyleLeftValue(el3);
                        expect(first > second).to.equal(true);
                        let saved_locally = JSON.parse(localStorage.getItem("svelte-object-explorer"));
                        expect(saved_locally.width.toString()).to.equal((VIEWPORT_WIDTH - clientX).toString());
                    });
            });

            it("Drag edge too far to the left, will increase panel width to max", function () {
                setViewportAndVisitUrl(url + "/Expander/Example1");
                let first, second, clientX;
                const leftmost = 26;

                //mousedown on edge, get position
                cy.get(".width_adjust_hover_zone")
                    .click()
                    .trigger("mousedown")
                    .then((el) => {
                        first = getStyleLeftValue(el);
                        clientX = first - 464;
                    });

                // move mouse to the left
                cy.window().then((win) => {
                    win.dispatchEvent(new win.MouseEvent("mousemove", { clientX, clientY: 0 }));
                    win.dispatchEvent(new win.MouseEvent("mouseup", { clientX, clientY: 0 }));
                });

                //mouseup, get position again,mouseup compare
                cy.get(".width_adjust_hover_zone")
                    .click() // doing this instead of mouseup which isn't working
                    .then((el3) => {
                        second = getStyleLeftValue(el3);
                        expect(second.toString()).to.equal(leftmost.toString());
                        let saved_locally = JSON.parse(localStorage.getItem("svelte-object-explorer"));
                        expect(saved_locally.width.toString()).to.equal((VIEWPORT_WIDTH - clientX).toString());
                    });
            });

            it("Drag edge to the right, will decrease panel width", function () {
                setViewportAndVisitUrl(url + "/Expander/Example1");
                let first, second, clientX;

                //mousedown on edge, get position
                cy.get(".width_adjust_hover_zone")
                    .click()
                    .trigger("mousedown")
                    .then((el) => {
                        first = getStyleLeftValue(el);
                        clientX = 510;
                    });

                // move mouse to the left
                cy.window().then((win) => {
                    win.dispatchEvent(new win.MouseEvent("mousemove", { clientX, clientY: 0 }));
                    win.dispatchEvent(new win.MouseEvent("mouseup", { clientX, clientY: 0 }));
                });

                //mouseup, get position again, mouseup compare
                cy.get(".width_adjust_hover_zone")
                    .click() // doing this instead of mouseup which isn't working
                    .then((el3) => {
                        second = getStyleLeftValue(el3);
                        expect(first < second).to.equal(true);
                        let saved_locally = JSON.parse(localStorage.getItem("svelte-object-explorer"));
                        expect(saved_locally.width.toString()).to.equal((VIEWPORT_WIDTH - clientX).toString());
                    });
            });

            it("Drag edge too far to the right, will decrease panel width to min", function () {
                setViewportAndVisitUrl(url + "/Expander/Example1");
                let first, second, clientX;
                const rightmost = 554;

                //mousedown on edge, get position
                cy.get(".width_adjust_hover_zone")
                    .click()
                    .trigger("mousedown")
                    .then((el) => {
                        first = getStyleLeftValue(el);
                        clientX = 559;
                    });

                // move mouse to the left
                cy.window().then((win) => {
                    win.dispatchEvent(new win.MouseEvent("mousemove", { clientX, clientY: 0 }));
                    win.dispatchEvent(new win.MouseEvent("mouseup", { clientX, clientY: 0 }));
                });

                //mouseup, get position again,mouseup compare
                cy.get(".width_adjust_hover_zone")
                    .click() // doing this instead of mouseup which isn't working
                    .then((el3) => {
                        second = getStyleLeftValue(el3);
                        expect(second.toString()).to.equal(rightmost.toString());
                        let saved_locally = JSON.parse(localStorage.getItem("svelte-object-explorer"));

                        expect(saved_locally.width.toString()).to.equal((VIEWPORT_WIDTH - clientX).toString());
                    });
            });
        });
    });

    describe(url + ": " + "Using SvelteValue to expand deep dom elements", function () {
        describe("No expansion if SvelteValue is not used", function () {
            const rows = 4;
            const content_row = 8;
            it(`should have ${rows} rows of data to start with`, function () {
                setViewportAndVisitUrl(url + "/Expander/Example1");

                cy.get("div.row").should("have.length", rows);
            });

            it("should show unexpanded top level div", function () {
                nthSelectorEqualsText(rows - 2, "span.val", "<div></div>");
            });

            it("can expand all nested divs, to reveal expected content", function () {
                for (let index = 1; index < 7; index++) {
                    nthSelectorClick(index, "span.dataArrow");
                }
                nthSelectorEqualsText(content_row, "span.val", "Deeply Nested Content");
            });
        });

        describe("Auto-expansion if SvelteValue is used", function () {
            const expander1_row = 8;
            const expander2_row = 20;
            const expander3_row = 34;
            const expander3_child_arrow = 20;
            const expander4_child_arrow = 27;

            //below are true after above have been expanded
            const expander4_row = 50;
            const rows = 63;

            it(`has ${rows} rows of data to start with`, function () {
                setViewportAndVisitUrl(url + "/Expander/Example2");
                nthSelectorClick(expander3_child_arrow, "span.dataArrow");
                nthSelectorClick(expander4_child_arrow, "span.dataArrow");
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

    describe(url + ": " + "Settings - 'rows' override", function () {
        describe("No rows - has no effect on existing values", function () {
            it("visit test page", function () {
                setViewportAndVisitUrl(url + "/Plugins/Example1/?test=1");
            });

            it_unaffectedValuesAreUnchanged();
        });

        describe("readme Example1: custom HTML row", function () {
            it("visit test page", function () {
                setViewportAndVisitUrl(url + "/Plugins/Example1/?test=2");
            });
            it_unaffectedValuesAreUnchanged();
            const selector = ".test2";
            const first = 0;
            it("Basic html override", function () {
                nthSelectorEqualsText(first, selector, "containsABC: valuecontainingabc");
            });
            it("Has red text", function () {
                cy.get(selector)
                    .should("have.attr", "style")
                    .then(function (style) {
                        expect(style).to.eq("color:red");
                    });
            });
        });

        describe("readme Example2: overriding the value of an existing 'String' Type", function () {
            it("visit test page", function () {
                setViewportAndVisitUrl(url + "/Plugins/Example1/?test=3");
            });
            it_unaffectedValuesAreUnchanged("string");
            it("Overrides all strings by adding '!'", function () {
                const string_val = 1;
                const val = 12;
                nthSelectorEqualsText(string_val, "span.val", "testy!");
                nthSelectorEqualsText(val, "span.val", "valuecontainingabc!");
            });
        });

        describe("readme Example3: simplifying an object", function () {
            it("visit test page", function () {
                setViewportAndVisitUrl(url + "/Plugins/Example1/?test=4");
            });
            it_unaffectedValuesAreUnchanged();
            it("Displays conctatenated value 'test1 (test10)'", function () {
                const val = 12;
                nthSelectorEqualsText(val, "span.val", "test1 (test10)");
            });
            it("Displays updated 'string' type instead of original 'object'", function () {
                const type = 10;
                nthSelectorEqualsText(type, "span.type", "string");
            });
        });

        describe("readme Example4: changing the type", function () {
            it("visit test page", function () {
                setViewportAndVisitUrl(url + "/Plugins/Example1/?test=5");
            });
            it_unaffectedValuesAreUnchanged();
            it("Displays updated 'my_type' type instead of original 'object'", function () {
                const type = 10;
                nthSelectorEqualsText(type, "span.type", "my_type");
            });
        });

        describe("readme Example5: tweaking row_settings, without changing html", function () {
            it("visit test page", function () {
                setViewportAndVisitUrl(url + "/Plugins/Example1/?test=6");
            });
            it_unaffectedValuesAreUnchanged();
            it("Updates key to 'mykey'", function () {
                const key = 10;
                nthSelectorEqualsText(key, "span.key", "mykey");
            });
            it("Displays conctatenated value 'containsABC: valuecontainingabc'", function () {
                const val = 12;
                nthSelectorEqualsText(val, "span.val", "containsABC: valuecontainingabc");
            });
            it("Updates type to 'my_type'", function () {
                const type = 10;
                nthSelectorEqualsText(type, "span.type", "my_type");
            });
            const num_spaces = 12;
            it(`Updates indent spaces to ${num_spaces}`, function () {
                const selector = "div.row span";
                const span = 62;

                cy.get(selector)
                    .eq(span)
                    .invoke("text")
                    .then((text) => {
                        const spaces = text.split("mykey");
                        console.log(spaces);
                        expect(spaces[0].length).to.equal(num_spaces);
                    });
            });
        });

        describe("readme Example2a: multiple overrides - of the value of an existing 'String' Type", function () {
            it("visit test page", function () {
                setViewportAndVisitUrl(url + "/Plugins/Example1/?test=7");
            });
            it_unaffectedValuesAreUnchanged();
            const first = 12;
            const second = 13;
            const third = 14;
            it("1st Override applies to first matching string by adding '-1'", function () {
                nthSelectorEqualsText(first, "span.val", "valuecontainingabc-1");
            });
            it("1st and 3rd Overrides apply to SECOND matching string by adding '-13' - to demonstrate it works in order", function () {
                nthSelectorEqualsText(second, "span.val", "valuecontainingabc1-13");
            });
            it("1st, 2nd and 3rd Overrides apply to THIRD matching string by adding '-123'- to demonstrate it works in order", function () {
                nthSelectorEqualsText(third, "span.val", "valuecontainingabc12-123");
            });
        });

        describe.only("readme Example6: matches, but no overrides - has no effect on existing values", function () {
            it("visit test page", function () {
                setViewportAndVisitUrl(url + "/Plugins/Example1/?test=8");
            });
            it_unaffectedValuesAreUnchanged();
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

function it_unaffectedValuesAreUnchanged(exceptions = "") {
    it("basic values are unaffected", function () {
        const array_arrow = 1;
        const object_arrow = 2;

        const array_len = 1;
        const object_len = 2;

        const string_val = 1;
        const array_first_val = 3;
        const object_first_val = 8;

        nthSelectorClick(array_arrow, "span.dataArrow");
        nthSelectorClick(object_arrow, "span.dataArrow");

        nthSelectorEqualsText(array_len, "span.len", "(3)");
        nthSelectorEqualsText(object_len, "span.len", "(2)");

        if (!exceptions.includes("string")) {
            nthSelectorEqualsText(string_val, "span.val", "testy");
            nthSelectorEqualsText(array_first_val, "span.val", "one");
            nthSelectorEqualsText(object_first_val, "span.val", "test1");
        }
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

function nthSelectorClick(n, selector) {
    cy.get(selector).eq(n).click();
}

function setViewportAndVisitUrl(url) {
    cy.viewport(VIEWPORT_WIDTH, 600);
    cy.visit(url);
}

function getStyleLeftValue(el) {
    let value_with_px = el[0].style.left;
    return parseInt(value_with_px.substring(0, value_with_px.length - 2));
}

function mouseMoveX(x) {
    cy.window().then((win) => {
        win.dispatchEvent(new win.MouseEvent("mousemove", { clientX: x, clientY: 0 }));
        win.dispatchEvent(new win.MouseEvent("mouseup", { clientX: x, clientY: 0 }));
    });
}
