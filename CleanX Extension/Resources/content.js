(() => {
    const TAB_LIST_SELECTOR = '[role="tablist"]';
    const TAB_SELECTOR = '[role="tab"], a[role="tab"]';
    const CHECK_INTERVAL_MS = 700;

    function isForYouTab(tab) {
        const label = (tab.innerText || tab.textContent || "").trim().toLowerCase().replace(/\s+/g, " ");
        return label.includes("for you") || label.includes("おすすめ");
    }

    function getTabsInside(element) {
        const tabs = Array.from(element.querySelectorAll(TAB_SELECTOR));

        if (element.matches(TAB_SELECTOR)) {
            tabs.unshift(element);
        }

        return tabs;
    }

    function getSingleTabSlot(tab, tabList) {
        let slot = tab;
        let element = tab;

        while (element && element !== tabList) {
            const tabs = getTabsInside(element);
            const onlyContainsTargetTab = tabs.length === 1 && tabs[0] === tab;

            if (onlyContainsTargetTab) {
                slot = element;
            }

            element = element.parentElement;
        }

        return slot;
    }

    function hideElement(element) {
        element.style.display = "none";
        element.style.visibility = "hidden";
        element.style.pointerEvents = "none";
        element.setAttribute("aria-hidden", "true");
    }

    function hideForYouTabs() {
        const tabLists = document.querySelectorAll(TAB_LIST_SELECTOR);

        tabLists.forEach((tabList) => {
            const tabs = tabList.querySelectorAll(TAB_SELECTOR);
            if (!tabs.length) return;

            tabs.forEach((tab) => {
                if (isForYouTab(tab)) {
                    hideElement(getSingleTabSlot(tab, tabList));
                }
            });
        });
    }

    const observer = new MutationObserver(hideForYouTabs);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    hideForYouTabs();
    setInterval(hideForYouTabs, CHECK_INTERVAL_MS);
})();
