sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    "use strict";

    return {

        onRejection: async function (oContext) {

            try {

                await oContext.setProperty(
                    "status",
                    "Rejected"
                );

                MessageToast.show(
                    "Leave rejected successfully."
                );

            } catch (oError) {

                console.error(oError);

                MessageToast.show(
                    "Rejection failed."
                );
            }
        }
    };
});