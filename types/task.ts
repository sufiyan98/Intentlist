/**
 * Domain Models - Task Aggregate
 * Phase 1: Core task domain with value objects
 */

import { z } from 'zod';

// ============================================
// Value Objects
// ============================================

/**
 * Task ID value object
 */
export class TaskId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Task ID cannot be empty');
    }
  }

  equals(other: TaskId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): TaskId {
    return new TaskId(value);
  }
}

/**
 * Task Title value object
 */
export class TaskTitle {
  private static readonly MAX_LENGTH = 200;

  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }
    if (value.length > TaskTitle.MAX_LENGTH) {
      throw new Error(`Task title cannot exceed ${TaskTitle.MAX_LENGTH} characters`);
    }
  }

  equals(other: TaskTitle): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): TaskTitle {
    return new TaskTitle(value.trim());
  }
}

/**
 * Duration value object (in minutes)
 */
export class Duration {
  private static readonly VALID_DURATIONS = [5, 15, 30, 60, 120] as const;

  constructor(public readonly minutes: number | null) {
    if (minutes !== null && !Duration.VALID_DURATIONS.includes(minutes as any)) {
      throw new Error(`Invalid duration. Must be one of: ${Duration.VALID_DURATIONS.join(', ')}`);
    }
  }

  equals(other: Duration): boolean {
    return this.minutes === other.minutes;
  }

  toString(): string {
    if (this.minutes === null) return 'Any duration';
    if (this.minutes >= 60) {
      const hours = this.minutes / 60;
      return hours === 1 ? '1 hour' : `${hours}+ hours`;
    }
    return `${this.minutes} min`;
  }

  static create(minutes: number | null): Duration {
    return new Duration(minutes);
  }

  static fromValue(value: number | null): Duration {
    return new Duration(value);
  }
}

/**
 * Mood State value object
 */
export type MoodStateValue = 'focused' | 'low_energy' | 'between_things' | 'creative' | 'quick_clear' | 'any';

export class MoodState {
  private static readonly VALID_STATES: MoodStateValue[] = [
    'focused',
    'low_energy',
    'between_things',
    'creative',
    'quick_clear',
    'any',
  ];

  constructor(public readonly value: MoodStateValue) {
    if (!MoodState.VALID_STATES.includes(value)) {
      throw new Error(`Invalid mood state: ${value}`);
    }
  }

  equals(other: MoodState): boolean {
    return this.value === other.value;
  }

  isAny(): boolean {
    return this.value === 'any';
  }

  toString(): string {
    return this.value;
  }

  static create(value: MoodStateValue): MoodState {
    return new MoodState(value);
  }

  static any(): MoodState {
    return new MoodState('any');
  }
}

// ============================================
// Task Entity
// ============================================

export type TaskStatus = 'active' | 'completed' | 'someday' | 'deleted';

export interface TaskData {
  id: TaskId;
  userId: string;
  title: TaskTitle;
  notes: string | null;
  status: TaskStatus;
  requiredMood: MoodState | null;
  estimatedDuration: Duration | null;
  personTag: string | null;
  dueDate: number | null;
  completedAt: number | null;
  createdAt: number;
  updatedAt: number;
  sortOrder: number;
  frictionScore: number;
  frictionIntervenedAt: number | null;
  timesSnoozed: number;
  timesDueDateMoved: number;
  timesScrolledPast: number;
  isSynced: boolean;
  serverUpdatedAt: number | null;
}

export class Task {
  public readonly id: TaskId;
  public readonly userId: string;
  public readonly title: TaskTitle;
  public readonly notes: string | null;
  public status: TaskStatus;
  public readonly requiredMood: MoodState | null;
  public readonly estimatedDuration: Duration | null;
  public readonly personTag: string | null;
  public readonly dueDate: number | null;
  public completedAt: number | null;
  public readonly createdAt: number;
  public updatedAt: number;
  public readonly sortOrder: number;
  public frictionScore: number;
  public readonly frictionIntervenedAt: number | null;
  public readonly timesSnoozed: number;
  public readonly timesDueDateMoved: number;
  public readonly timesScrolledPast: number;
  public readonly isSynced: boolean;
  public readonly serverUpdatedAt: number | null;

  constructor(data: TaskData) {
    this.id = data.id;
    this.userId = data.userId;
    this.title = data.title;
    this.notes = data.notes;
    this.status = data.status;
    this.requiredMood = data.requiredMood;
    this.estimatedDuration = data.estimatedDuration;
    this.personTag = data.personTag;
    this.dueDate = data.dueDate;
    this.completedAt = data.completedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.sortOrder = data.sortOrder;
    this.frictionScore = data.frictionScore;
    this.frictionIntervenedAt = data.frictionIntervenedAt;
    this.timesSnoozed = data.timesSnoozed;
    this.timesDueDateMoved = data.timesDueDateMoved;
    this.timesScrolledPast = data.timesScrolledPast;
    this.isSynced = data.isSynced;
    this.serverUpdatedAt = data.serverUpdatedAt;
  }

  /**
   * Check if task is active
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Check if task is completed
   */
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * Check if task is in someday list
   */
  isSomeday(): boolean {
    return this.status === 'someday';
  }

  /**
   * Mark task as completed
   */
  complete(): void {
    this.status = 'completed';
    this.completedAt = Date.now();
    this.updatedAt = Date.now();
  }

  /**
   * Move task to someday list
   */
  moveToSomeday(): void {
    this.status = 'someday';
    this.updatedAt = Date.now();
  }

  /**
   * Mark task as deleted
   */
  delete(): void {
    this.status = 'deleted';
    this.updatedAt = Date.now();
  }

  /**
   * Increment friction score
   */
  addFriction(points: number): void {
    this.frictionScore += points;
    this.updatedAt = Date.now();
  }

  /**
   * Reset friction score
   */
  resetFriction(): void {
    this.frictionScore = 0;
    this.updatedAt = Date.now();
  }

  /**
   * Check if task needs friction intervention
   */
  needsIntervention(threshold: number): boolean {
    return this.frictionScore >= threshold;
  }

  /**
   * Convert to plain object for serialization
   */
  toPlainObject(): Omit<TaskData, 'id' | 'title' | 'requiredMood' | 'estimatedDuration'> & {
    id: string;
    title: string;
    requiredMood: string | null;
    estimatedDuration: number | null;
  } {
    return {
      id: this.id.toString(),
      userId: this.userId,
      title: this.title.toString(),
      notes: this.notes,
      status: this.status,
      requiredMood: this.requiredMood?.toString() ?? null,
      estimatedDuration: this.estimatedDuration?.minutes ?? null,
      personTag: this.personTag,
      dueDate: this.dueDate,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      sortOrder: this.sortOrder,
      frictionScore: this.frictionScore,
      frictionIntervenedAt: this.frictionIntervenedAt,
      timesSnoozed: this.timesSnoozed,
      timesDueDateMoved: this.timesDueDateMoved,
      timesScrolledPast: this.timesScrolledPast,
      isSynced: this.isSynced,
      serverUpdatedAt: this.serverUpdatedAt,
    };
  }

  /**
   * Create Task from plain object
   */
  static fromPlainObject(data: {
    id: string;
    userId: string;
    title: string;
    notes: string | null;
    status: TaskStatus;
    requiredMood: string | null;
    estimatedDuration: number | null;
    personTag: string | null;
    dueDate: number | null;
    completedAt: number | null;
    createdAt: number;
    updatedAt: number;
    sortOrder: number;
    frictionScore: number;
    frictionIntervenedAt: number | null;
    timesSnoozed: number;
    timesDueDateMoved: number;
    timesScrolledPast: number;
    isSynced: boolean;
    serverUpdatedAt: number | null;
  }): Task {
    return new Task({
      id: TaskId.create(data.id),
      userId: data.userId,
      title: TaskTitle.create(data.title),
      notes: data.notes,
      status: data.status,
      requiredMood: data.requiredMood ? MoodState.create(data.requiredMood as MoodStateValue) : null,
      estimatedDuration: data.estimatedDuration ? Duration.create(data.estimatedDuration) : null,
      personTag: data.personTag,
      dueDate: data.dueDate,
      completedAt: data.completedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      sortOrder: data.sortOrder,
      frictionScore: data.frictionScore,
      frictionIntervenedAt: data.frictionIntervenedAt,
      timesSnoozed: data.timesSnoozed,
      timesDueDateMoved: data.timesDueDateMoved,
      timesScrolledPast: data.timesScrolledPast,
      isSynced: data.isSynced,
      serverUpdatedAt: data.serverUpdatedAt,
    });
  }
}

// ============================================
// Zod Schemas for Validation
// ============================================

export const taskInputSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().nullable().optional(),
  requiredMood: z.enum(['focused', 'low_energy', 'between_things', 'creative', 'quick_clear', 'any']).nullable().optional(),
  estimatedDuration: z.number().nullable().optional(),
  personTag: z.string().nullable().optional(),
  dueDate: z.number().nullable().optional(),
  sortOrder: z.number().optional(),
});

export type TaskInput = z.infer<typeof taskInputSchema>;
