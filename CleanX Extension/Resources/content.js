(() => {
    const TAB_LIST_SELECTOR = '[role="tablist"][aria-label]';
    const TAB_SELECTOR = '[role="tab"]';
    const CHECK_INTERVAL_MS = 700;

    function isForYouTab(tab) {
        const label = (tab.innerText || tab.textContent || "").trim().toLowerCase();
        return label === "for you" || label === "おすすめ";
    }

    function isFollowingTab(tab) {
        const label = (tab.innerText || tab.textContent || "").trim().toLowerCase();
        return label === "following" || label === "フォロー中";
    }

    function hideForYouAndOpenFollowing() {
        const tabLists = document.querySelectorAll(TAB_LIST_SELECTOR);

        tabLists.forEach((tabList) => {
            const tabs = tabList.querySelectorAll(TAB_SELECTOR);
            let followingTab = null;

            tabs.forEach((tab) => {
                if (isForYouTab(tab)) {
                    tab.style.display = "none";
                    tab.setAttribute("aria-hidden", "true");
                }

                if (isFollowingTab(tab)) {
                    followingTab = tab;
                }
            });

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

    hideForYouAndOpenFollowing();
    setInterval(hideForYouAndOpenFollowing, CHECK_INTERVAL_MS);
})();
