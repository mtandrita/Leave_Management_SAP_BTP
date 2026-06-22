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
                var oModel = this.getOwnerComponent().getModel();
                var aNotifications = await oModel
                    .bindList("/Notification")
                    .requestContexts(0, 500);

                var iCount = 0;
                aNotifications.forEach(function (oContext) {
                    var oData = oContext.getObject();
                    if (
                        oData.employeeName === "Tandrita Mukherjee" &&
                        !oData.isRead
                    ) {
                        iCount++;
                    }
                });

                this.byId("notificationBadge").setText(String(iCount));
                this.byId("notificationBadge").setVisible(iCount > 0);
            } catch (err) {
                console.error("Notification Count Error", err);
            }
        },

        onOpenNotifications: async function () {
            try {
                var oModel = this.getOwnerComponent().getModel();
                var aNotifications = await oModel
                    .bindList("/Notification")
                    .requestContexts(0, 500);

                aNotifications.sort(function (a, b) {
                    return new Date(b.getObject().createdAt) - new Date(a.getObject().createdAt);
                });

                for (const oContext of aNotifications) {
                    var oData = oContext.getObject();
                    if (
                        oData.employeeName === "Tandrita Mukherjee" &&
                        !oData.isRead
                    ) {
                        await oContext.setProperty("isRead", true);
                    }
                }

                this.loadNotificationCount();

                var oList = this.byId("notificationList");
                var oBinding = oList.getBinding("items");

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

                this.byId("notificationDialog").open();
            } catch (err) {
                console.error("Notification Error", err);
            }
        },
        onCloseNotifications: function () {
            this.byId("notificationDialog").close();
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
            // Optional layout context adjustments
        },

        onSubmitLeave: async function () {
            // FIX: "Tandrita Mukherjee" is hardcoded in the view, no drop-down element exists
            var sEmployee = "Tandrita Mukherjee";

            var oLeaveTypeSelect = this.byId("leaveTypeSelect");
            var oLeaveType = oLeaveTypeSelect ? oLeaveTypeSelect.getSelectedItem() : null;
            var dFrom = this.byId("fromDate").getDateValue();
            var dTo = this.byId("toDate").getDateValue();
            var sReason = this.byId("reasonText").getValue();

            if (!oLeaveType) {
                MessageToast.show("Please select a leave type");
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

            if (dFrom < oToday) {
                MessageToast.show("Cannot apply leave for past dates");
                return;
            }

            if (dFrom > dTo) {
                MessageToast.show("From Date cannot be after To Date");
                return;
            }

            /*
             * Sunday Rule:
             * - Leave can contain Sunday in between.
             * - Leave cannot start on Sunday.
             * - Leave cannot end on Sunday.
             */
            if (dFrom.getDay() === 0) {
                MessageToast.show("Leave cannot start on Sunday");
                return;
            }

            if (dTo.getDay() === 0) {
                MessageToast.show("Leave cannot end on Sunday");
                return;
            }

            var sLeaveType = oLeaveType.getText();
            var bIsHalfDay = this.byId("halfDayBox").getSelected();
            var sHalfDayPeriod = "";

            if (bIsHalfDay) {
                sHalfDayPeriod = this.byId("halfDayPeriod").getSelectedKey();
                if (!sHalfDayPeriod) {
                    MessageToast.show("Please select Morning or Afternoon");
                    return;
                }
                dTo = dFrom;
            }

            try {
                var oModel = this.getOwnerComponent().getModel();
                var requestedDays;

                if (bIsHalfDay) {
                    requestedDays = 0.5;
                } else {
                    requestedDays = Math.floor((dTo.getTime() - dFrom.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                }

                // Fetch employee balance
                var aEmployees = await oModel.bindList("/Employees").requestContexts(0, 1000);

                console.log("EMPLOYEES:", aEmployees.map(c => c.getObject()));
                console.log("DEBUG: Total employees fetched from model:", aEmployees.length);

                var oEmployeeData = null;

                aEmployees.forEach(function (oContext) {
                    var oData = oContext.getObject();
                    // Log each name found in the database for comparison
                    console.log("DEBUG: Checking DB record Name: '" + oData.Name + "' against Target: '" + sEmployee + "'");

                    if (oData.Name && oData.Name.trim() === sEmployee.trim()) {
                        oEmployeeData = oData;
                    }
                });

                if (!oEmployeeData) {
                    console.error("DEBUG: No matching employee found in the list of " + aEmployees.length + " records.");
                    MessageToast.show("Employee record not found");
                    return;
                }

                // Validate balance
                if (sLeaveType === "Casual Leave" && requestedDays > oEmployeeData.casualBalance) {
                    MessageToast.show("Insufficient Casual Leave balance. Available: " + oEmployeeData.casualBalance + ", Requested: " + requestedDays);
                    return;
                }

                if (sLeaveType === "Sick Leave" && requestedDays > oEmployeeData.sickBalance) {
                    MessageToast.show("Insufficient Sick Leave balance. Available: " + oEmployeeData.sickBalance + ", Requested: " + requestedDays);
                    return;
                }
                if (sLeaveType === "Paid Leave" && requestedDays > oEmployeeData.paidLeaveBalance) { // 👈 ADDED THIS BLOCK
                    MessageToast.show("Insufficient Paid Leave balance. Available: " + oEmployeeData.paidLeaveBalance + ", Requested: " + requestedDays);
                    return;
                }

                var aLeaves = await oModel.bindList("/LeaveRequest").requestContexts(0, 500);
                var bConflict = false;

                aLeaves.forEach(function (oContext) {
                    var oData = oContext.getObject();
                    if (oData.employeeName === sEmployee && oData.status === "Approved") {
                        var dExistingStart = new Date(oData.startDate);
                        var dExistingEnd = new Date(oData.endDate);

                        if (dFrom <= dExistingEnd && dTo >= dExistingStart) {
                            bConflict = true;
                        }
                    }
                });

                if (bConflict) {
                    MessageToast.show("Approved leave already exists for selected date(s)");
                    return;
                }

                var sStartDate = dFrom.getFullYear() + "-" +
                    String(dFrom.getMonth() + 1).padStart(2, "0") + "-" +
                    String(dFrom.getDate()).padStart(2, "0");

                var sEndDate = dTo.getFullYear() + "-" +
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

                var oBinding = oModel.bindList("/LeaveRequest");
                var oCreatedContext = oBinding.create(oPayload);

                await oCreatedContext.created();
                var oLeave = oCreatedContext.getObject();
                var sLeaveId = oLeave.id;

                await this._uploadAttachments(sLeaveId);
                console.log("LEAVE CREATED =", sLeaveId);

                setTimeout(function () {
                    this.loadCalendarLeaves();
                }.bind(this), 1000);
                MessageToast.show(bIsHalfDay ? "Half-Day Leave Submitted Successfully" : "Leave Submitted Successfully", {
                    onClose: function () {
                        window.location.reload(); // Hard reloads the tab, wiping the cache completely
                    }
                });
                this.byId("leaveDialog").close();
            } catch (oError) {
                console.error(oError);
                MessageToast.show("Failed to submit leave");
            }
        },

        loadEmployeeBalance: async function () {
    try {
        var oModel = this.getOwnerComponent().getModel();
        var aEmployees = await oModel.bindList("/Employees").requestContexts(0, 100);

        aEmployees.forEach(function (oContext) {
            var oData = oContext.getObject();
            if (oData.Name === "Tandrita Mukherjee") {
                this.byId("casualBalanceTile").setText(Number(oData.casualBalance));
this.byId("sickBalanceTile").setText(Number(oData.sickBalance));
this.byId("paidLeaveBalanceTile").setText(Number(oData.paidLeaveBalance)); // 👈 ADDED THIS LINE
            }
        }.bind(this));
    } catch (err) {
        console.error("Balance Load Error", err);
    }
},
        loadCalendarLeaves: async function () {
            try {
                var oModel = this.getOwnerComponent().getModel();
                var aLeaves = await oModel.bindList("/LeaveRequest").requestContexts(0, 500);

                this.oCalendar1.destroySpecialDates();
                this.oCalendar2.destroySpecialDates();

                aLeaves.forEach(function (oContext) {
                    var oData = oContext.getObject();
                    if (oData.employeeName !== "Tandrita Mukherjee") {
                        return;
                    }

                    var sType = "Type01";
                    if (oData.status === "Approved") { sType = "Type08"; }
                    if (oData.status === "Rejected") { sType = "Type04"; }

                    var aStart = oData.startDate.split("-");
                    var dStart = new Date(Number(aStart[0]), Number(aStart[1]) - 1, Number(aStart[2]));

                    var aEnd = oData.endDate.split("-");
                    var dEnd = new Date(Number(aEnd[0]), Number(aEnd[1]) - 1, Number(aEnd[2]));
                    dEnd.setHours(23, 59, 59, 999);

                    this.oCalendar1.addSpecialDate(new DateTypeRange({ startDate: dStart, endDate: dEnd, type: sType }));
                    this.oCalendar2.addSpecialDate(new DateTypeRange({ startDate: dStart, endDate: dEnd, type: sType }));
                }.bind(this));
            } catch (err) {
                console.error("Calendar Load Error", err);
            }
        },

        _uploadAttachments: async function (sLeaveId) {

            console.log("UPLOAD FUNCTION HIT");

            var aFiles = this._aFiles || [];

            if (aFiles.length === 0) {
                console.log("No file selected");
                return;
            }

            var oFile = aFiles[0];

            console.log("FILE =", oFile.name);

            try {

                const arrayBuffer = await oFile.arrayBuffer();

                const base64 = btoa(
                    String.fromCharCode(...new Uint8Array(arrayBuffer))
                );

                var oModel = this.getOwnerComponent().getModel();

                const oAttachmentContext = oModel
                    .bindList("/LeaveAttachment")
                    .create({
                        fileName: oFile.name,
                        mimeType: oFile.type || "application/octet-stream",
                        size: oFile.size,
                        content: base64,
                        leave_id: sLeaveId
                    });

                await oAttachmentContext.created();

                console.log("ATTACHMENT SAVED");

            } catch (e) {

                console.error("ATTACHMENT FAILED", e);

            }
        },

        onFileChange: function (oEvent) {
            this._aFiles = oEvent.getParameter("files");
            console.log("Selected files:", this._aFiles);
        }
    });
});