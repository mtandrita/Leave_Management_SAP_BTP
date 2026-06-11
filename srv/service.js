const cds = require('@sap/cds');

console.log("SERVICE JS LOADED");

module.exports = cds.service.impl(async function () {

   const {
    LeaveRequest,
    Employees,
    Notification
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

        let deduction =
            leave.isHalfDay ? 0.5 : 1;

        console.log("DEDUCTION =", deduction);

        if (leave.leaveType === "Casual Leave") {

            await tx.run(
                UPDATE(Employees)
                    .set({
                        casualBalance:
                            employee.casualBalance - deduction
                    })
                    .where({
                        id: employee.id
                    })
            );

            console.log(
                "CASUAL UPDATED TO",
                employee.casualBalance - deduction
            );

        } else if (leave.leaveType === "Sick Leave") {

            await tx.run(
                UPDATE(Employees)
                    .set({
                        sickBalance:
                            employee.sickBalance - deduction
                    })
                    .where({
                        id: employee.id
                    })
            );

            console.log(
                "SICK UPDATED TO",
                employee.sickBalance - deduction
            );
        }
        await tx.run(
    INSERT.into(Notification).entries({
        employeeName: leave.employeeName,
        message:
            `Your ${leave.leaveType} request has been approved`,
        createdAt: new Date(),
        isRead: false
    })
);

        return "Approved";
    });

});