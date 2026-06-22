sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (ControllerExtension, Filter, FilterOperator) {
    "use strict";

    async function updateBellCount(oControllerInstance) {
        try {
            const oModel = oControllerInstance.base.getExtensionAPI().getModel();
            if (!oModel) return;

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
                        $btn.attr("data-count", iCount > 0 ? iCount : "");
                    }
                }, 100);
            }
        } catch (e) {
            console.error("Notification Badge Update Failed: ", e);
        }
    }

    function applyStatusFilter(oControllerInstance, bShowPendingOnly) {
        try {
            var oTable = oControllerInstance.base.getView().byId("project2::LeaveRequestList--fe::table::LeaveRequests::LineItem");
            if (!oTable) return;

            var oRowBinding = oTable.getRowBinding();
            if (!oRowBinding) return;

            if (bShowPendingOnly) {
                var oPendingFilter = new Filter({
                    filters: [
                        new Filter("status", FilterOperator.EQ, "Pending"),
                        new Filter("status", FilterOperator.EQ, "pending")
                    ],
                    and: false
                });
                oRowBinding.filter(oPendingFilter);
            } else {
                oRowBinding.filter([]);
            }
        } catch (err) {
            console.warn("Table filter application deferred: binding not ready yet.");
        }
    }

    return ControllerExtension.extend("project2.ext.controller.ListPage", {
        _bPendingOnly: true,

        override: {
            onInit: function () {
                console.log("LIST PAGE CONTROLLER LOADED SUCCESSFULLY");
                var oSelf = this;

                setTimeout(function () {
                    updateBellCount(oSelf);
                    setInterval(function () { updateBellCount(oSelf); }, 10000);
                }, 3000);
            },

            onBeforeRendering: function () {
                var oSelf = this;
                // Applies the filter as the view mounts safely
                setTimeout(function () {
                    applyStatusFilter(oSelf, oSelf._bPendingOnly);
                }, 1000);
            }
        },

        onToggleRequestsView: function (oEvent) {
            var oButton = oEvent.getSource();
            this._bPendingOnly = !this._bPendingOnly;

            if (this._bPendingOnly) {
                applyStatusFilter(this, true);
                oButton.setText("Show All Requests");
            } else {
                applyStatusFilter(this, false);
                oButton.setText("Show Pending Only");
            }
        }
    });
});