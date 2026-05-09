(() => {
    const TAB_LIST_SELECTOR = '[role="tablist"]';
    const TAB_SELECTOR = '[role="tab"], a[role="tab"]';
    const CHECK_INTERVAL_MS = 700;
    const LIVE_QUERY = "f=live";

    function ensureFollowingTimelineOnHome() {
        if (window.location.hostname !== "x.com" && window.location.hostname !== "twitter.com") {
            return;
        }

        if (window.location.pathname !== "/home") {
            return;
        }

        if (window.location.search.includes(LIVE_QUERY)) {
            return;
        }

        const nextUrl = `${window.location.origin}/home?${LIVE_QUERY}`;
        window.location.replace(nextUrl);
    }

    function installSpaNavigationHook() {
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function (...args) {
            const result = originalPushState.apply(this, args);
            ensureFollowingTimelineOnHome();
            return result;
        };

        history.replaceState = function (...args) {
            const result = originalReplaceState.apply(this, args);
            ensureFollowingTimelineOnHome();
            return result;
        };

        window.addEventListener("popstate", ensureFollowingTimelineOnHome);
    }

    function isForYouTab(tab) {
        const label = (tab.innerText || tab.textContent || "").trim().toLowerCase().replace(/\s+/g, " ");
        return label.includes("for you") || label.includes("おすすめ");
    }

    function isFollowingTab(tab) {
        const label = (tab.innerText || tab.textContent || "").trim().toLowerCase().replace(/\s+/g, " ");
        return label.includes("following") || label.includes("フォロー中");
    }

    function hideTab(tab) {
        tab.style.display = "none";
        tab.style.visibility = "hidden";
        tab.style.pointerEvents = "none";
        tab.setAttribute("aria-hidden", "true");
    }

    function hideForYouAndOpenFollowing() {
        const tabLists = document.querySelectorAll(TAB_LIST_SELECTOR);

        tabLists.forEach((tabList) => {
            const tabs = tabList.querySelectorAll(TAB_SELECTOR);
            if (!tabs.length) return;

            let followingTab = null;
            let forYouTab = null;

            tabs.forEach((tab) => {
                if (isForYouTab(tab)) {
                    forYouTab = tab;
                }

                if (isFollowingTab(tab)) {
                    followingTab = tab;
                }
            });

            if (!followingTab || !forYouTab) return;

            hideTab(forYouTab);

            if (
                followingTab &&
                followingTab.getAttribute("aria-selected") !== "true"
            ) {
                followingTab.click();
            }
        });
    }

    const observer = new MutationObserver(hideForYouAndOpenFollowing);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    installSpaNavigationHook();
    ensureFollowingTimelineOnHome();
    hideForYouAndOpenFollowing();
    setInterval(hideForYouAndOpenFollowing, CHECK_INTERVAL_MS);
})();
