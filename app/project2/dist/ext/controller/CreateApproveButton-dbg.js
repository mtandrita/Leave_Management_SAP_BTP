sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    "use strict";

    return {

        OnApprove: async function (oContext) {

            try {

                var oModel = oContext.getModel();
                var oData = oContext.getObject();

                var oAction =
                    oModel.bindContext("/approveLeave(...)");

                oAction.setParameter(
                    "ID",
                    oData.id
                );

                await oAction.invoke();
                oModel.refresh();

                MessageToast.show(
                    "Leave approved successfully."
                );

            } catch (oError) {

                console.error(oError);

                MessageToast.show(
                    "Approval failed."
                );
            }
        }
    };
});