sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/unified/DateTypeRange"
], function (Controller, MessageToast, DateTypeRange) {
    "use strict";

    return Controller.extend("project1.controller.View1", {

        onInit: function () {

            this.oCalendar1 = this.byId("calendar1");
            this.oCalendar2 = this.byId("calendar2");

            if (this.oCalendar1 && this.oCalendar2) {

    var oToday = new Date();

    var oNextMonth = new Date(
        oToday.getFullYear(),
        oToday.getMonth() + 1,
        1
    );

    this.oCalendar1.focusDate(oToday);
    this.oCalendar2.focusDate(oNextMonth);
}

this.loadCalendarLeaves();

this.loadEmployeeBalance();
this.loadNotificationCount();
        },

        onApplyLeave: function () {

            this.byId("fromDate").setValue("");
            this.byId("toDate").setValue("");
            this.byId("reasonText").setValue("");

            this.byId("halfDayBox").setSelected(false);
            this.byId("halfDayContainer").setVisible(false);

            this.byId("leaveDialog").open();
        },

        onCloseDialog: function () {
            this.byId("leaveDialog").close();
        },

        onOpenHistory: function () {

    var oTable = this.byId("historyTable");

    var oBinding = oTable.getBinding("items");

    if (oBinding) {

        sap.ui.require([
            "sap/ui/model/Filter",
            "sap/ui/model/FilterOperator"
        ], function (Filter, FilterOperator) {

            oBinding.filter([
                new Filter(
                    "employeeName",
                    FilterOperator.EQ,
                    "Tandrita Mukherjee"
                )
            ]);

        });

    }

    this.byId("historyDialog").open();
},

        onCloseHistory: function () {
            this.byId("historyDialog").close();
        },
        loadNotificationCount: async function () {

    try {

        var oModel =
            this.getOwnerComponent().getModel();

        var aNotifications =
            await oModel
                .bindList("/Notification")
                .requestContexts(0, 500);

        var iCount = 0;

        aNotifications.forEach(function (oContext) {

            var oData = oContext.getObject();

            if (
                oData.employeeName ===
                "Tandrita Mukherjee" &&
                !oData.isRead
            ) {
                iCount++;
            }

        });

        this.byId(
            "notificationBell"
        ).setText(
            String(iCount)
        );

    } catch (err) {

        console.error(
            "Notification Count Error",
            err
        );
    }
},
onOpenNotifications: async function () {

    try {

        var oModel =
            this.getOwnerComponent().getModel();

        var aNotifications =
            await oModel
                .bindList("/Notification")
                .requestContexts(0, 500);

        for (const oContext of aNotifications) {

            var oData =
                oContext.getObject();

            if (
                oData.employeeName ===
                "Tandrita Mukherjee" &&
                !oData.isRead
            ) {

                await oContext.setProperty(
                    "isRead",
                    true
                );
            }
        }

        this.loadNotificationCount();

        var oList =
            this.byId("notificationList");

        var oBinding =
            oList.getBinding("items");

        if (oBinding) {

            sap.ui.require([
                "sap/ui/model/Filter",
                "sap/ui/model/FilterOperator"
            ], function (
                Filter,
                FilterOperator
            ) {

                oBinding.filter([
                    new Filter(
                        "employeeName",
                        FilterOperator.EQ,
                        "Tandrita Mukherjee"
                    )
                ]);

            });

        }

        this.byId(
            "notificationDialog"
        ).open();

    } catch (err) {

        console.error(
            "Notification Error",
            err
        );

    }
},

onCloseNotifications: function () {

    this.byId(
        "notificationDialog"
    ).close();
},
        onOpenProfile: function () {
            this.byId("profileDialog").open();
        },

        onCloseProfile: function () {
            this.byId("profileDialog").close();
        },

        onHalfDayToggle: function (oEvent) {

            var bSelected = oEvent.getParameter("selected");

            this.byId("halfDayContainer").setVisible(bSelected);

            if (bSelected) {

                var dFrom = this.byId("fromDate").getDateValue();

                if (dFrom) {
                    this.byId("toDate").setDateValue(dFrom);
                }
            }
        },

        onCalendarSelect: function () {
            // Optional
        },

        onSubmitLeave: async function () {

    var oEmployee = this.byId("employeeSelect").getSelectedItem();
    var oLeaveType = this.byId("leaveTypeSelect").getSelectedItem();

    var dFrom = this.byId("fromDate").getDateValue();
    var dTo = this.byId("toDate").getDateValue();

    var sReason = this.byId("reasonText").getValue();

    if (!oEmployee || !oLeaveType) {
        MessageToast.show("Please select employee and leave type");
        return;
    }

    if (!dFrom || !dTo) {
        MessageToast.show("Please select From Date and To Date");
        return;
    }

    var oToday = new Date();
    oToday.setHours(0, 0, 0, 0);

    dFrom.setHours(0, 0, 0, 0);
    dTo.setHours(0, 0, 0, 0);

    // Past date validation
    if (dFrom < oToday) {
        MessageToast.show("Cannot apply leave for past dates");
        return;
    }

    if (dFrom > dTo) {
        MessageToast.show("From Date cannot be after To Date");
        return;
    }

    // Sunday validation
    var dCurrent = new Date(dFrom);

    while (dCurrent <= dTo) {

        if (dCurrent.getDay() === 0) {
            MessageToast.show("Leave cannot be applied on Sundays");
            return;
        }

        dCurrent.setDate(dCurrent.getDate() + 1);
    }

    var sEmployee = oEmployee.getText();
    var sLeaveType = oLeaveType.getText();

    var bIsHalfDay = this.byId("halfDayBox").getSelected();

    var sHalfDayPeriod = "";

    if (bIsHalfDay) {

        sHalfDayPeriod =
            this.byId("halfDayPeriod").getSelectedKey();

        if (!sHalfDayPeriod) {
            MessageToast.show("Please select Morning or Afternoon");
            return;
        }

        dTo = dFrom;
    }

    try {

        var oModel = this.getOwnerComponent().getModel();

        /* ==========================================
           CHECK OVERLAP WITH APPROVED LEAVES
        ========================================== */

        var aLeaves = await oModel
            .bindList("/LeaveRequest")
            .requestContexts(0, 500);

        var bConflict = false;

        aLeaves.forEach(function (oContext) {

            var oData = oContext.getObject();

            if (
                oData.employeeName === sEmployee &&
                oData.status === "Approved"
            ) {

                var dExistingStart =
                    new Date(oData.startDate);

                var dExistingEnd =
                    new Date(oData.endDate);

                if (
                    dFrom <= dExistingEnd &&
                    dTo >= dExistingStart
                ) {
                    bConflict = true;
                }
            }

        });

        if (bConflict) {

            MessageToast.show(
                "Approved leave already exists for selected date(s)"
            );

            return;
        }

        /* ==========================================
           CREATE REQUEST
        ========================================== */

        var sStartDate =
            dFrom.getFullYear() + "-" +
            String(dFrom.getMonth() + 1).padStart(2, "0") + "-" +
            String(dFrom.getDate()).padStart(2, "0");

        var sEndDate =
            dTo.getFullYear() + "-" +
            String(dTo.getMonth() + 1).padStart(2, "0") + "-" +
            String(dTo.getDate()).padStart(2, "0");

        var oPayload = {
    employeeName: sEmployee,
    leaveType: sLeaveType,
    startDate: sStartDate,
    endDate: sEndDate,
    status: "Pending",
    reason: sReason,

    isHalfDay: bIsHalfDay,
    halfDayPeriod: sHalfDayPeriod
};
        var oBinding =
            oModel.bindList("/LeaveRequest");

        await oBinding.create(oPayload);

        setTimeout(function () {
            this.loadCalendarLeaves();
        }.bind(this), 1000);

        MessageToast.show(
            bIsHalfDay ?
            "Half-Day Leave Submitted Successfully" :
            "Leave Submitted Successfully"
        );

        this.byId("leaveDialog").close();

    } catch (oError) {

        console.error(oError);

        MessageToast.show(
            "Failed to submit leave"
        );
    }
},
loadEmployeeBalance: async function () {

    try {

        var oModel =
            this.getOwnerComponent().getModel();

        var aEmployees = await oModel
            .bindList("/Employees")
            .requestContexts(0, 100);

        aEmployees.forEach(function (oContext) {

            var oData = oContext.getObject();

            if (
                oData.Name ===
                "Tandrita Mukherjee"
            ) {

                this.byId(
                    "casualBalanceTile"
                ).setValue(
                    oData.casualBalance
                );

                this.byId(
                    "sickBalanceTile"
                ).setValue(
                    oData.sickBalance
                );
            }

        }.bind(this));

    } catch (err) {

        console.error(
            "Balance Load Error",
            err
        );

    }
},

           

        loadCalendarLeaves: async function () {

    try {

        var oModel = this.getOwnerComponent().getModel();

        var aLeaves = await oModel
            .bindList("/LeaveRequest")
            .requestContexts(0, 500);

        this.oCalendar1.destroySpecialDates();
        this.oCalendar2.destroySpecialDates();

        aLeaves.forEach(function (oContext) {

            var oData = oContext.getObject();

            // ONLY current employee
            if (oData.employeeName !== "Tandrita Mukherjee") {
                return;
            }

            var sType = "Type01"; // Yellow = Pending

            if (oData.status === "Approved") {
                sType = "Type08"; // Green
            }

            if (oData.status === "Rejected") {
                sType = "Type04"; // Red
            }

            var aStart = oData.startDate.split("-");
            var dStart = new Date(
                Number(aStart[0]),
                Number(aStart[1]) - 1,
                Number(aStart[2])
            );

            var aEnd = oData.endDate.split("-");
            var dEnd = new Date(
                Number(aEnd[0]),
                Number(aEnd[1]) - 1,
                Number(aEnd[2])
            );

            dEnd.setHours(23, 59, 59, 999);

            this.oCalendar1.addSpecialDate(
                new DateTypeRange({
                    startDate: dStart,
                    endDate: dEnd,
                    type: sType
                })
            );

            this.oCalendar2.addSpecialDate(
                new DateTypeRange({
                    startDate: dStart,
                    endDate: dEnd,
                    type: sType
                })
            );

        }.bind(this));

    } catch (err) {

        console.error("Calendar Load Error", err);

   }
}

    });
});