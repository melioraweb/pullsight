export function getTimePeriod(billingCycle) {
    let periodStart = new Date()
    let periodEnd
    if (billingCycle == 'monthly') {
        periodEnd = new Date(new Date().setMonth(new Date().getMonth() + 1))
    } else if (billingCycle == 'yearly') {
        periodEnd = new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
        )
    } else if (billingCycle == 'fortnightly') {
        periodEnd = new Date(new Date().setDate(new Date().getDate() + 14))
    } else if (billingCycle == 'weekly') {
        periodEnd = new Date(new Date().setDate(new Date().getDate() + 7))
    }
    return {
        periodStart,
        periodEnd
    }
}
