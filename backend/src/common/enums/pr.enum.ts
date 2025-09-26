export enum PRState {
    OPEN = 'open',
    MERGED = 'merged',
    DECLINED = 'declined',
    SUPERSEDED = 'superseded'
}

export enum PREvent {
    CREATED = 'created',
    UPDATED = 'updated',
    APPROVED = 'approved',
    UNAPPROVED = 'unapproved',
    MERGED = 'merged',
    DECLINED = 'declined',
    DELETED = 'deleted'
}

export function mapPREventToState(event: PREvent): PRState {
    switch (event) {
        case PREvent.CREATED:
        case PREvent.UPDATED:
            return PRState.OPEN
        case PREvent.MERGED:
            return PRState.MERGED
        case PREvent.DECLINED:
            return PRState.DECLINED
        default:
            return PRState.OPEN
    }
}

export enum Severity {
    INFO = 'Info',
    MINOR = 'Minor',
    MAJOR = 'Major',
    CRITICAL = 'Critical',
    BLOCKER = 'Blocker'
}
