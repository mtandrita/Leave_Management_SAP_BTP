sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    "use strict";

    return {

        onRejection: async function (oContext) {
            try {
                var oModel = oContext.getModel();
                var oData = oContext.getObject();

                var oAction = oModel.bindContext("/rejectLeave(...)");

                oAction.setParameter("ID", oData.id);

                await oAction.invoke();
                oModel.refresh();

                MessageToast.show("Leave rejected successfully.");
            } catch (oError) {
                console.error(oError);
                MessageToast.show("Rejection failed.");
            }
        }
    };
});