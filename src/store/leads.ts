import { create } from 'zustand';
import { leads as initialLeads } from '@/mock/leads';
import { projects } from '@/mock/projects';
import type {
  Activity,
  ActivityOutcome,
  ActivityType,
  Lead,
  LeadSource,
  Project,
} from '@/types/lead';

type AddActivityInput = {
  leadId: string;
  type: ActivityType;
  content?: string;
  outcome?: ActivityOutcome;
  nextFollowupAt?: string;
};

export type CreateLeadInput = {
  fullName: string;
  phone: string;
  primaryProject: Project;
  source?: LeadSource;
  unitTypeInterests?: string[];
  notes?: string;
  nextFollowupAt?: string;
};

type State = {
  leads: Lead[];
  getById: (id: string) => Lead | undefined;
  addActivity: (input: AddActivityInput) => void;
  createLead: (input: CreateLeadInput) => Lead;
};

export const useLeads = create<State>((set, get) => ({
  leads: initialLeads,
  getById: (id) => get().leads.find((l) => l.id === id),
  addActivity: ({ leadId, type, content, outcome, nextFollowupAt }) => {
    const now = new Date().toISOString();
    const activity: Activity = {
      id: `a-${Date.now()}`,
      leadId,
      type,
      content,
      outcome,
      createdBy: 'u-sale-1',
      createdAt: now,
    };
    set((s) => ({
      leads: s.leads.map((l) =>
        l.id === leadId
          ? {
              ...l,
              activities: [activity, ...l.activities],
              nextFollowupAt: nextFollowupAt ?? l.nextFollowupAt,
              updatedAt: now,
            }
          : l
      ),
    }));
  },
  createLead: (input) => {
    const now = new Date().toISOString();
    const lead: Lead = {
      id: `l-${Date.now()}`,
      phone: input.phone,
      fullName: input.fullName,
      source: input.source ?? 'OTHER',
      status: 'NEW',
      primaryProject: input.primaryProject,
      unitTypeInterests: input.unitTypeInterests,
      nextFollowupAt: input.nextFollowupAt,
      notes: input.notes,
      activities: [],
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ leads: [lead, ...s.leads] }));
    return lead;
  },
}));

export function findProjectById(id: string | null): Project | undefined {
  if (!id) return undefined;
  return projects.find((p) => p.id === id);
}
