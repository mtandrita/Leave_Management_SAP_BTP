sap.ui.define([
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/List",
    "sap/m/StandardListItem"
], function (
    Dialog,
    Button,
    List,
    StandardListItem
) {
    "use strict";
    console.log("LIST REPORT EXT LOADED");

    // Helper to get the bound OData v4 model dynamically
    function getODataModel() {
        const oBtn = sap.ui.getCore().byId(
            "project2::LeaveRequestList--fe::CustomAction::Notifications"
        );
        return oBtn ? oBtn.getModel() : null;
    }

    async function updateBellCount() {
        try {
            const oModel = getODataModel();
            if (!oModel) return;

            // Use UI5 framework routing instead of raw fetch pathing
            const oListBinding = oModel.bindList("/AdminNotification");
            const aContexts = await oListBinding.requestContexts(0, 100);
            
            const iCount = aContexts.filter(function(oCtx) {
                return oCtx.getProperty("isRead") === false;
            }).length;

            const oBtn = sap.ui.getCore().byId(
                "project2::LeaveRequestList--fe::CustomAction::Notifications"
            );

            if (oBtn) {
                oBtn.addStyleClass("notificationBell");

                setTimeout(function () {
                    const $btn = oBtn.$();
                    if ($btn.length) {
                        $btn.attr(
                            "data-count",
                            iCount > 0 ? iCount : ""
                        );
                    }
                }, 100);
            }

        } catch (e) {
            console.error("Notification count error", e);
        }
    }

    // Initial load
    setTimeout(function () {
        updateBellCount();

        // Refresh every 10 seconds
        setInterval(function () {
            updateBellCount();
        }, 10000);
    }, 3000);

    return {
        openNotifications: async function () {
            await updateBellCount();
            console.log("Bell updated from click");
            console.log("NOTIFICATION BUTTON CLICKED");

            try {
                const oModel = getODataModel();
                if (!oModel) throw new Error("OData Model is unavailable.");

                // Fetch full notification list using UI5 secure channels
                const oListBinding = oModel.bindList("/AdminNotification");
                const aContexts = await oListBinding.requestContexts(0, 100);

                // Map data properties safely out of the OData context bindings
                const aNotifications = aContexts.map(oCtx => oCtx.getObject()).sort(
                    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                );

                const iUnread = aNotifications.filter(n => !n.isRead).length;
                const oList = new List();

                aNotifications.forEach(function (item) {
                    oList.addItem(
                        new StandardListItem({
                            title: item.message,
                            description: item.createdAt || item.employeeName
                        })
                    );
                });

                // Mark unread notifications as read via standard OData context PATCH
                for (const oContext of aContexts) {
                    if (oContext.getProperty("isRead") === false) {
                        await oContext.setProperty("isRead", true); 
                    }
                }

                // Update bell badge immediately
                await updateBellCount();

                const oDialog = new Dialog({
                    title: "Notifications (" + iUnread + ")",
                    content: [oList],
                    endButton: new Button({
                        text: "Close",
                        press: function () {
                            oDialog.close();
                        }
                    })
                });

                oDialog.open();

            } catch (err) {
                console.error(err);
            }
        }
    };
});