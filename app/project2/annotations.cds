using LeaveService as service from '../../srv/service';
annotate service.LeaveRequest with @(
    // Adds the Employee Name as the Main Header Title
    UI.HeaderInfo : {
        TypeName       : 'Leave Request',
        TypeNamePlural : 'Leave Requests',
        Title          : {
            $Type : 'UI.DataField',
            Value : employeeName,
        },
        Description    : {
            $Type : 'UI.DataField',
            Value : leaveType, // Optional: Shows the type of leave right under the name
        }
    },
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Id2}',
                Value : id,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Employeename}',
                Value : employeeName,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Leavetype}',
                Value : leaveType,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Startdate}',
                Value : startDate,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Enddate}',
                Value : endDate,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Status}',
                Value : status,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Reason}',
                Value : reason,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : '{i18n>GeneralInformation}',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : '{i18n>Id1}',
            Value : id,
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>Employeename}',
            Value : employeeName,
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>Leavetype}',
            Value : leaveType,
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>Startdate}',
            Value : startDate,
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>Enddate}',
            Value : endDate,
        },
        {
            $Type : 'UI.DataField',
            Value : status,
            Label : '{i18n>Status}',
            Criticality : (
                case status
                    when 'Approved' then 3
                    when 'Pending'  then 2
                    when 'Rejected' then 1
                    else 0
                end
            )
        },
    ],
    UI.PresentationVariant : {
        $Type : 'UI.PresentationVariantType',
        VisualPreferences : [],
        RequestAtLeast : [ id ],
        SortOrder : [
            {
                $Type : 'UI.SortOrderType',
                Property : status,
                Descending : true
            }
        ]
    }
);

annotate service.LeaveRequest with @(
    UI.SelectionPresentationVariant #Default : {
        $Type : 'UI.SelectionPresentationVariantType',
        PresentationVariant : '@UI.PresentationVariant',
        SelectionVariant : {
            $Type : 'UI.SelectionVariantType',
            SelectOptions : []
        }
    }
);