sap.ui.define([
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/ObjectStatus"
], function (
    ColumnListItem,
    Text,
    ObjectStatus
) {
    "use strict";

    return {

        onAfterRendering: async function () {

            try {

                var oExtensionAPI =
                    this.base.getExtensionAPI();

                var oModel =
                    oExtensionAPI.getModel();

                var oContext =
                    oExtensionAPI.getBindingContext();

                var oCurrent =
                    oContext.getObject();

                var sEmployee =
                    oCurrent.employeeName;

                var oTable =
                    sap.ui.getCore().byId(
                        "leaveHistoryTable"
                    );

                if (!oTable) {
                    return;
                }

                oTable.removeAllItems();

                var aLeaves =
                    await oModel
                        .bindList("/LeaveRequest")
                        .requestContexts(0, 500);

                aLeaves.forEach(function (oCtx) {

                    var oLeave =
                        oCtx.getObject();

                    if (
                        oLeave.employeeName ===
                        sEmployee
                    ) {

                        oTable.addItem(

                            new ColumnListItem({

                                cells: [

                                    new Text({
                                        text:
                                        oLeave.leaveType
                                    }),

                                    new Text({
                                        text:
                                        oLeave.startDate
                                    }),

                                    new Text({
                                        text:
                                        oLeave.endDate
                                    }),

                                    new ObjectStatus({

                                        text:
                                        oLeave.status,

                                        state:
                                        oLeave.status === "Approved"
                                        ? "Success"
                                        : oLeave.status === "Rejected"
                                        ? "Error"
                                        : "Warning"

                                    })

                                ]

                            })

                        );

                    }

                });

            } catch (err) {

                console.error(
                    "Leave History Error",
                    err
                );

            }

        }

    };

});