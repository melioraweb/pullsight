export enum Status {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
    IN_REVIEW = 'in_review',
    IN_ACTIVE = 'in_active',
    DELETED = 'deleted'
}

export enum BookingStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    IN_ACTIVE = 'in_active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export enum PaymentStatus {
    PENDING = 'pending',
    UNPAID = 'unpaid',
    PAID = 'paid',
    REFUNDED = 'refunded',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

export enum CertificateStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted'
}
