(() => {
    const TAB_LIST_SELECTOR = '[role="tablist"]';
    const TAB_SELECTOR = '[role="tab"], a[role="tab"]';
    const POST_SELECTOR = 'article[data-testid="tweet"], article[role="article"]';
    const AD_MARKER_SELECTOR = [
        '[data-testid="placementTracking"]',
        '[aria-label="Ad"]',
        '[aria-label="広告"]',
        '[aria-label="Promoted"]',
        '[aria-label="プロモーション"]',
        '[title="Ad"]',
        '[title="広告"]',
        '[title="Promoted"]',
        '[title="プロモーション"]',
    ].join(",");
    const AD_LABELS = new Set(["ad", "advertisement", "promoted", "広告", "プロモーション"]);
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

    function hasExactAdLabel(element) {
        const label = (element.innerText || element.textContent || "").trim().toLowerCase().replace(/\s+/g, " ");
        return AD_LABELS.has(label);
    }

    function isAdPost(post) {
        if (post.querySelector(AD_MARKER_SELECTOR)) {
            return true;
        }

        const labelCandidates = post.querySelectorAll("span, div[dir='ltr'], div[aria-label], a[aria-label]");
        return Array.from(labelCandidates).some((element) => hasExactAdLabel(element));
    }

    function hideAdPosts() {
        const posts = document.querySelectorAll(POST_SELECTOR);

        posts.forEach((post) => {
            if (isAdPost(post)) {
                hideElement(post);
            }
        });
    }

    function cleanPage() {
        hideForYouTabs();
        hideAdPosts();
    }

    const observer = new MutationObserver(cleanPage);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    cleanPage();
    setInterval(cleanPage, CHECK_INTERVAL_MS);
})();
