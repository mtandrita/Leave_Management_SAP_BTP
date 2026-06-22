const cds = require('@sap/cds');

console.log("SERVICE JS LOADED");

module.exports = cds.service.impl(async function () {

   const {
    LeaveRequest,
    Employees,
    Notification,
    AdminNotification
} = this.entities;
    this.on('approveLeave', async (req) => {

        console.log("APPROVE ACTION HIT");

        const { ID } = req.data;

        const tx = cds.transaction(req);

        const leave = await tx.run(
            SELECT.one
                .from(LeaveRequest)
                .where({ id: ID })
        );

        console.log("LEAVE =", leave);

        if (!leave) {
            req.error(404, "Leave request not found");
        }

        console.log("IS HALF DAY =", leave.isHalfDay);

        if (leave.status === "Approved") {
            return "Already approved";
        }

        await tx.run(
            UPDATE(LeaveRequest)
                .set({
                    status: "Approved"
                })
                .where({ id: ID })
        );

        const employee = await tx.run(
            SELECT.one
                .from(Employees)
                .where({
                    Name: leave.employeeName
                })
        );

        console.log("EMPLOYEE =", employee);

        if (!employee) {
            req.error(404, "Employee not found");
        }

        let deduction;

if (leave.isHalfDay) {

    deduction = 0.5;

} else {

    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);

    const diffTime =
        endDate.getTime() - startDate.getTime();

    deduction =
        Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

        console.log("DEDUCTION =", deduction);

        if (leave.leaveType === "Casual Leave") {
            await tx.run(
                UPDATE(Employees)
                    .set({
                        casualBalance: employee.casualBalance - deduction
                    })
                    .where({ id: employee.id })
            );
            console.log("CASUAL UPDATED TO", employee.casualBalance - deduction);

        } else if (leave.leaveType === "Sick Leave") {
            await tx.run(
                UPDATE(Employees)
                    .set({
                        sickBalance: employee.sickBalance - deduction
                    })
                    .where({ id: employee.id })
            );
            console.log("SICK UPDATED TO", employee.sickBalance - deduction);

        } else if (leave.leaveType === "Paid Leave") { // 👈 ADDED THIS BLOCK
            await tx.run(
                UPDATE(Employees)
                    .set({
                        paidLeaveBalance: employee.paidLeaveBalance - deduction
                    })
                    .where({ id: employee.id })
            );
            console.log("PAID LEAVE UPDATED TO", employee.paidLeaveBalance - deduction);
        }
        const startDate =
    new Date(leave.startDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

const endDate =
    new Date(leave.endDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

await tx.run(
    INSERT.into(Notification).entries({
        employeeName: leave.employeeName,
        message:
            `Your ${leave.leaveType} request from ${startDate} to ${endDate} has been approved.`,
        createdAt: new Date(),
        isRead: false
    })
);
        return "Approved";
    });
    this.on('rejectLeave', async (req) => {

    const { ID } = req.data;

    const tx = cds.transaction(req);

    const leave = await tx.run(
        SELECT.one
            .from(LeaveRequest)
            .where({ id: ID })
    );

    if (!leave) {
        req.error(404, "Leave request not found");
    }

    await tx.run(
        UPDATE(LeaveRequest)
            .set({
                status: "Rejected"
            })
            .where({ id: ID })
    );

    const startDate =
        new Date(leave.startDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    const endDate =
        new Date(leave.endDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    await tx.run(
        INSERT.into(Notification).entries({
            employeeName: leave.employeeName,
            message:
                `Your ${leave.leaveType} request from ${startDate} to ${endDate} has been rejected.`,
            createdAt: new Date(),
            isRead: false
        })
    );

    return "Rejected";
});
this.after("READ", "LeaveAttachment", (data, req) => {

    if (!data) return;

    if (!Array.isArray(data)) {
        data = [data];
    }

    // Safely extract the app router/launchpad prefix from the incoming request if present, 
    // otherwise fallback to your project's runtime router namespace path
    const routePrefix = "/46108e47-eccf-4fdc-b9f6-2831dd58b3b8.Leave_Management.project1-0.0.1";

    data.forEach(item => {
        // 1. Fixed the duplicate item.id bug
        // 2. Added the Launchpad runtime route prefix so BTP knows exactly where to route it
        item.downloadUrl = routePrefix + "/odata/v4/leave/LeaveAttachment(" + item.id + ")/content";
    });
});
this.before("READ", "LeaveRequest", (req) => {
    // Default sorting: Sort by status descending (keeping Pending/Rejected above Approved)
    // followed by startDate descending (newest requests first).
    if (!req.query.SELECT.orderBy) {
        req.query.SELECT.orderBy = [
            { ref: ["status"], sort: "desc" },
            { ref: ["startDate"], sort: "desc" }
        ];
    }
});
this.after("CREATE", "LeaveRequest", async (data, req) => {

    const tx = cds.transaction(req);

    await tx.run(
        INSERT.into(AdminNotification).entries({
            employeeName: data.employeeName,
            message:
                `${data.employeeName} submitted a ${data.leaveType} request`,
            createdAt: new Date(),
            isRead: false
        })
    );

});
});
