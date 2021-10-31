const emptySettings = {};

const rateLimit100 = emptySettings;
const rateLimit500 = { ratelimit: 500 };
const rateLimit1000 = { ratelimit: 1000 };

const open1 = emptySettings;
const open2 = { open: "string1" };
const open3 = { open: "bananaman" };
const open4 = { open: "html" };

const fade1 = { fade: true };
const fade2 = emptySettings;

const tab1 = emptySettings;
const tab2 = { tabposition: "top" };
const tab3 = { tabposition: "middle" };
const tab4 = { tabposition: "bottom" };

export default {
    rateLimit100,
    rateLimit500,
    rateLimit1000,
    open1,
    open2,
    open3,
    open4,
    fade1,
    fade2,
    tab1,
    tab2,
    tab3,
    tab4,
};
