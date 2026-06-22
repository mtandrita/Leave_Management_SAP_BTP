sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension"
], function (ControllerExtension) {
    "use strict";

    return ControllerExtension.extend(
        "project2.ext.controller.ObjectPageController",
        {
            override: {

                onInit: function () {

                    console.log("=== OBJECT PAGE CONTROLLER LOADED ===");

                    setInterval(() => {

                        try {

                            const oStatusText = sap.ui.getCore().byId(
                                "project2::LeaveRequestObjectPage--fe::FormContainer::GeneratedFacet1::FormElement::DataField::status::Field-display"
                            );

                            const oApproveBtn = sap.ui.getCore().byId(
                                "project2::LeaveRequestObjectPage--fe::FooterBar::CustomAction::CustomApproveButton"
                            );

                            const oRejectBtn = sap.ui.getCore().byId(
                                "project2::LeaveRequestObjectPage--fe::FooterBar::CustomAction::customRejectButton"
                            );

                            if (!oStatusText || !oApproveBtn || !oRejectBtn) {
                                return;
                            }

                            // Multiple fallback methods
                            let sStatus = "";

                            if (oStatusText.getText) {
                                sStatus = oStatusText.getText() || "";
                            }

                            if (!sStatus && oStatusText.mProperties) {
                                sStatus = oStatusText.mProperties.text || "";
                            }

                            sStatus = sStatus.trim();

                            console.log("Current Status:", sStatus);

                            const bDisable =
                                sStatus === "Approved" ||
                                sStatus === "Rejected";

                            oApproveBtn.setEnabled(!bDisable);
                            oRejectBtn.setEnabled(!bDisable);

                            console.log(
                                "Approve Enabled:",
                                oApproveBtn.getEnabled()
                            );

                            console.log(
                                "Reject Enabled:",
                                oRejectBtn.getEnabled()
                            );

                            console.log(
                                "Buttons Disabled:",
                                bDisable
                            );

                        } catch (oError) {

                            console.error(
                                "Button Enablement Error:",
                                oError
                            );
                        }

                    }, 1000);
                }
            }
        }
    );
});