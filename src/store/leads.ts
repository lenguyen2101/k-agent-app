import { create } from 'zustand';
import { leads as initialLeads } from '@/mock/leads';
import { projects } from '@/mock/projects';
import type {
  Activity,
  ActivityOutcome,
  ActivityType,
  Lead,
  LeadOffer,
  LeadSource,
  LeadStatus,
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

export type UpdateLeadInput = {
  fullName?: string;
  phone?: string;
  primaryProject?: Project;
  unitTypeInterests?: string[];
  source?: LeadSource;
  notes?: string;
  nextFollowupAt?: string | null;
};

type State = {
  leads: Lead[];
  getById: (id: string) => Lead | undefined;
  addActivity: (input: AddActivityInput) => void;
  createLead: (input: CreateLeadInput) => Lead;
  updateLead: (id: string, patch: UpdateLeadInput) => void;
  setStatus: (id: string, status: LeadStatus) => void;
  acceptOffer: (offer: LeadOffer) => Lead;
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
  acceptOffer: (offer) => {
    const now = new Date().toISOString();
    const existing = get().leads.find((l) => l.id === offer.lead.id);
    if (existing) return existing;
    const lead: Lead = {
      id: offer.lead.id,
      phone: offer.lead.phone,
      fullName: offer.lead.fullName,
      source: offer.lead.source,
      status: 'NEW',
      primaryProject: offer.lead.primaryProject,
      noxhProfile: offer.lead.noxhProfile,
      activities: [],
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ leads: [lead, ...s.leads] }));
    return lead;
  },
  setStatus: (id, status) => {
    const now = new Date().toISOString();
    set((s) => ({
      leads: s.leads.map((l) =>
        l.id === id ? { ...l, status, updatedAt: now } : l
      ),
    }));
  },
  updateLead: (id, patch) => {
    const now = new Date().toISOString();
    set((s) => ({
      leads: s.leads.map((l) => {
        if (l.id !== id) return l;
        return {
          ...l,
          fullName: patch.fullName ?? l.fullName,
          phone: patch.phone ?? l.phone,
          primaryProject: patch.primaryProject ?? l.primaryProject,
          unitTypeInterests: patch.unitTypeInterests ?? l.unitTypeInterests,
          source: patch.source ?? l.source,
          notes: patch.notes !== undefined ? patch.notes : l.notes,
          nextFollowupAt:
            patch.nextFollowupAt === null
              ? undefined
              : patch.nextFollowupAt ?? l.nextFollowupAt,
          updatedAt: now,
        };
      }),
    }));
  },
}));

export function findProjectById(id: string | null): Project | undefined {
  if (!id) return undefined;
  return projects.find((p) => p.id === id);
}
