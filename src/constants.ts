export enum WeekDay {
    ALL = 0,
    MONDAY = 1 << 0,
    TUESDAY = 1 << 1,
    WEDNESDAY = 1 << 2,
    THURSDAY = 1 << 3,
    FRIDAY = 1 << 4,
    SATURDAY = 1 << 5,
    SUNDAY = 1 << 6,
}

export enum DaySegments {
    ALL = 0,
    MORNING = 1 << 0,
    NOON = 1 << 1,
    AFTERNOON = 1 << 2,
    NIGHT = 1 << 3,
    BEDTIME = 1 << 4,
}

export enum Priority { LOW, MEDIUM, HIGH, HIGHEST }

export enum RepetitionType { ONCE, MULTIPLE }

export enum TaskState {
    TODO = 0, IN_PROGRESS = 1, BLOCKED = 2, DONE = 3,
}
