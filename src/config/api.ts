import {
  IBackendRes,
  ICompany,
  IUser,
  IModelPaginate,
  IGetAccount,
  IJob,
  IResume,
  IPermission,
  IRole,
  ISubscribers,
  IIDashboardOverview,
  IDashboardResumesStats,
  IDashboardInsights,
  ICompanyDetail,
  ISavedJob,
} from '@/types/backend';
import axios from 'config/axios-customize';
import type { ICv } from '@/components/cv/cv-model';

/**
 * 
Module Auth
 */
export const callFetchAccount = () => {
  return axios.get<IBackendRes<IGetAccount>>('/api/v1/auth/account');
};

/**
 * Upload single file
 */
export const callUploadSingleFile = (file: any, folder: string) => {
  const bodyFormData = new FormData();
  bodyFormData.append('fileUpload', file);
  bodyFormData.append('folder', folder);
  return axios<
    IBackendRes<{
      url: string;
      key: string;
      originalName: string;
      mimeType: string;
      size: number;
      fileName?: string;
    }>
  >({
    method: 'post',
    url: '/api/v1/files/upload',
    data: bodyFormData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 
Module Company
 */
export const callCreateCompany = (
  name: string,
  address: string,
  description: string,
  logo: string,
  phone?: string,
  email?: string,
  website?: string
) => {
  return axios.post<IBackendRes<ICompany>>('/api/v1/companies', {
    name,
    address,
    description,
    logo,
    phone,
    email,
    website,
  });
};

export const callUpdateCompany = (
  id: string,
  name: string,
  address: string,
  description: string,
  logo: string
) => {
  return axios.patch<IBackendRes<ICompany>>(`/api/v1/companies/${id}`, {
    name,
    address,
    description,
    logo,
  });
};

export const callDeleteCompany = (id: string) => {
  return axios.delete<IBackendRes<ICompany>>(`/api/v1/companies/${id}`);
};

export const callFetchCompany = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<ICompany>>>(`/api/v1/companies?${query}`);
};

export interface ICompanyHighlight {
  companyId: string;
  openJobs: number;
  locations: string[];
  topSkills: string[];
  rating: number;
  reviewCount: number;
}

export const callFetchCompanyHighlights = () => {
  return axios.get<IBackendRes<ICompanyHighlight[]>>('/api/v1/companies/highlights');
};

export const callFetchCompanyById = (id: string) => {
  return axios.get<IBackendRes<ICompanyDetail>>(`/api/v1/companies/${id}`);
};

/**
 * 
Module User
 */
export const callCreateUser = (user: IUser) => {
  return axios.post<IBackendRes<IUser>>('/api/v1/users', { ...user });
};

export const callUpdateUser = (user: IUser, id: string) => {
  return axios.patch<IBackendRes<IUser>>(`/api/v1/users/${id}`, { ...user });
};

export const callDeleteUser = (id: string) => {
  return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}`);
};

export const callFetchUser = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/users?${query}`);
};

/**
 * 
Module Job
 */
export const callCreateJob = (job: IJob) => {
  return axios.post<IBackendRes<IJob>>('/api/v1/jobs', { ...job });
};

export const callUpdateJob = (job: IJob, id: string) => {
  return axios.patch<IBackendRes<IJob>>(`/api/v1/jobs/${id}`, { ...job });
};

export const callDeleteJob = (id: string) => {
  return axios.delete<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
};

export const callFetchJob = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs?${query}`);
};

export interface IJobSuggestions {
  jobs: { name: string; count: number }[];
  companies: { _id: string; name: string; logo?: string; jobs: number }[];
}

export const callFetchJobSuggestions = (q: string) => {
  return axios.get<IBackendRes<IJobSuggestions>>(
    `/api/v1/jobs/suggestions?q=${encodeURIComponent(q)}`
  );
};

export const callFetchJobById = (id: string) => {
  return axios.get<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
};

/**
 * 
Module Resume
 */
export const callCreateResume = (url: string, companyId: any, jobId: any) => {
  return axios.post<IBackendRes<IResume>>('/api/v1/resumes', { url, companyId, jobId });
};

// note is shown to the candidate on their timeline (e.g. interview time and place)
export const callUpdateResumeStatus = (id: any, status: string, note?: string) => {
  return axios.patch<IBackendRes<IResume>>(`/api/v1/resumes/${id}`, { status, note });
};

export const callDeleteResume = (id: string) => {
  return axios.delete<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
};

export const callFetchResume = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IResume>>>(`/api/v1/resumes?${query}`);
};

export const callFetchResumeById = (id: string) => {
  return axios.get<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
};

/**
 * Short-lived (10 min) presigned link to a CV stored in the private bucket
 */
export const callFetchResumeFileUrl = (id: string) => {
  return axios.get<IBackendRes<{ url: string; expiresIn: number }>>(`/api/v1/resumes/${id}/file`);
};

export interface IPipelineJob {
  _id: string;
  name: string;
  companyName?: string;
  count: number;
}

export interface IPipelineItem {
  _id: string;
  email: string;
  userId?: string;
  candidateName: string;
  status: string;
  rating?: number;
  notesCount: number;
  jobId?: { _id: string; name: string } | null;
  companyId?: { _id: string; name: string; logo?: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface IResumeNote {
  _id: string;
  content: string;
  createdBy: { _id: string; email: string; name?: string };
  createdAt: string;
}

export interface IPipelineDetail extends Omit<IPipelineItem, 'notesCount' | 'jobId'> {
  jobId?: {
    _id: string;
    name: string;
    location?: string;
    level?: string;
    skills?: string[];
  } | null;
  notes: IResumeNote[];
  history?: { status: string; note?: string; updatedAt: string; updatedBy?: { email: string } }[];
}

export const callFetchPipeline = (jobId?: string) => {
  return axios.get<IBackendRes<{ jobs: IPipelineJob[]; items: IPipelineItem[] }>>(
    '/api/v1/resumes/pipeline',
    { params: jobId ? { jobId } : {} }
  );
};

export const callFetchPipelineDetail = (id: string) => {
  return axios.get<IBackendRes<IPipelineDetail>>(`/api/v1/resumes/pipeline/${id}`);
};

export const callRateResume = (id: string, rating: number) => {
  return axios.patch<IBackendRes<{ rating: number | null }>>(`/api/v1/resumes/${id}/rating`, {
    rating,
  });
};

export const callAddResumeNote = (id: string, content: string) => {
  return axios.post<IBackendRes<IResumeNote>>(`/api/v1/resumes/${id}/notes`, { content });
};

export const callDeleteResumeNote = (id: string, noteId: string) => {
  return axios.delete<IBackendRes<{ deleted: boolean }>>(`/api/v1/resumes/${id}/notes/${noteId}`);
};

/**
 * 
Module AI interview (ElevenLabs voice screening)
 */
export type AiInterviewStatus = 'INVITED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
export type AiInterviewLanguage = 'vi' | 'en';

export interface IAiInterviewEvaluation {
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  overallScore?: number;
  recommendation?: 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO';
  summary?: string;
  criteria?: { name: string; score: number; evidence: string }[];
  strengths?: string[];
  concerns?: string[];
  flags?: string[];
  extracted?: Record<string, string | number | null>;
  errorMessage?: string;
}

export interface IAiInterview {
  _id: string;
  status: AiInterviewStatus;
  language: AiInterviewLanguage;
  expiresAt: string;
  attempts: number;
  startedAt?: string;
  completedAt?: string;
  durationSecs?: number;
  transcript: { role: 'agent' | 'user'; message: string; timeInCallSecs?: number }[];
  evaluation?: IAiInterviewEvaluation;
  createdBy?: { _id: string; email: string };
  createdAt: string;
}

export interface IAiInterviewInvite {
  status: AiInterviewStatus;
  language: AiInterviewLanguage;
  expiresAt: string;
  attemptsLeft: number;
  durationMinutes: number;
  job: {
    _id: string;
    name: string;
    level?: string;
    companyName?: string;
    companyLogo?: string;
  } | null;
}

export const callInviteAiInterview = (
  resumeId: string,
  body: { language: AiInterviewLanguage; note?: string }
) => {
  return axios.post<
    IBackendRes<{ _id: string; status: AiInterviewStatus; expiresAt: string; inviteUrl: string }>
  >(`/api/v1/interviews/resume/${resumeId}/invite`, body);
};

export const callFetchAiInterviews = (resumeId: string) => {
  return axios.get<IBackendRes<IAiInterview[]>>(`/api/v1/interviews/resume/${resumeId}`);
};

export const callReevaluateAiInterview = (id: string) => {
  return axios.post<IBackendRes<{ status: string }>>(`/api/v1/interviews/${id}/evaluate`);
};

export const callFetchAiInterviewInvite = (token: string) => {
  return axios.get<IBackendRes<IAiInterviewInvite>>(`/api/v1/interviews/invite/${token}`);
};

export const callStartAiInterview = (token: string) => {
  return axios.post<
    IBackendRes<{
      signedUrl: string;
      dynamicVariables: Record<string, string | number | boolean>;
      attemptsLeft: number;
    }>
  >(`/api/v1/interviews/invite/${token}/start`, { consent: true });
};

export const callBindAiInterviewConversation = (token: string, conversationId: string) => {
  return axios.post<IBackendRes<{ attemptsLeft: number }>>(
    `/api/v1/interviews/invite/${token}/conversation`,
    { conversationId }
  );
};

export const callFetchResumeByUser = () => {
  return axios.post<IBackendRes<IResume[]>>(`/api/v1/resumes/by-user`);
};

export interface IAppliedJob {
  jobId: string;
  status: string;
  appliedAt: string;
}

export const callFetchAppliedJobs = () => {
  return axios.get<IBackendRes<IAppliedJob[]>>('/api/v1/resumes/applied-jobs');
};

/**
 * 
Module Saved jobs (current user's bookmarks)
 */
export const callFetchSavedJobs = () => {
  return axios.get<IBackendRes<ISavedJob[]>>('/api/v1/saved-jobs');
};

export const callFetchSavedJobIds = () => {
  return axios.get<IBackendRes<string[]>>('/api/v1/saved-jobs/ids');
};

export const callSaveJob = (jobId: string) => {
  return axios.post<IBackendRes<{ jobId: string; saved: boolean }>>('/api/v1/saved-jobs', {
    jobId,
  });
};

export const callUnsaveJob = (jobId: string) => {
  return axios.delete<IBackendRes<{ jobId: string; saved: boolean }>>(
    `/api/v1/saved-jobs/${jobId}`
  );
};

/**
 * 
Module Permission
 */
export const callCreatePermission = (permission: IPermission) => {
  return axios.post<IBackendRes<IPermission>>('/api/v1/permissions', { ...permission });
};

export const callUpdatePermission = (permission: IPermission, id: string) => {
  return axios.patch<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`, { ...permission });
};

export const callDeletePermission = (id: string) => {
  return axios.delete<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
};

export const callFetchPermission = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IPermission>>>(`/api/v1/permissions?${query}`);
};

export const callFetchPermissionById = (id: string) => {
  return axios.get<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
};

/**
 * 
Module Role
 */
export const callCreateRole = (role: IRole) => {
  return axios.post<IBackendRes<IRole>>('/api/v1/roles', { ...role });
};

export const callUpdateRole = (role: IRole, id: string) => {
  return axios.patch<IBackendRes<IRole>>(`/api/v1/roles/${id}`, { ...role });
};

export const callDeleteRole = (id: string) => {
  return axios.delete<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
};

export const callFetchRole = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IRole>>>(`/api/v1/roles?${query}`);
};

export const callFetchRoleById = (id: string) => {
  return axios.get<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
};

/**
 * 
Module Subscribers
 */
export const callCreateSubscriber = (subs: ISubscribers) => {
  return axios.post<IBackendRes<ISubscribers>>('/api/v1/subscribers', { ...subs });
};

export const callGetSubscriberSkills = () => {
  return axios.post<IBackendRes<ISubscribers>>('/api/v1/subscribers/skills');
};

export const callUpdateSubscriber = (subs: ISubscribers) => {
  return axios.patch<IBackendRes<ISubscribers>>(`/api/v1/subscribers`, { ...subs });
};

export const callDeleteSubscriber = (id: string) => {
  return axios.delete<IBackendRes<ISubscribers>>(`/api/v1/subscribers/${id}`);
};

export const callFetchSubscriber = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<ISubscribers>>>(`/api/v1/subscribers?${query}`);
};

export const callFetchSubscriberById = (id: string) => {
  return axios.get<IBackendRes<ISubscribers>>(`/api/v1/subscribers/${id}`);
};

/**
 * Module Dashboard
 **/
//get overview statistics //
export const callFetchDashboardOverview = () => {
  return axios.get<IBackendRes<IIDashboardOverview>>('/api/v1/admin/dashboard/stats/overview');
};

//get resumes statistics
export const callFetchDashboardResumes = () => {
  return axios.get<IBackendRes<IDashboardResumesStats>>('/api/v1/admin/dashboard/stats/resumes');
};

//get chart data for the dashboard (distributions, 30-day activity, recent items)
export const callFetchDashboardInsights = () => {
  return axios.get<IBackendRes<IDashboardInsights>>('/api/v1/admin/dashboard/stats/insights');
};

/**
 * 
Module CV builder (current user's online CVs)
 */
export const callFetchMyCvs = () => {
  return axios.get<IBackendRes<ICv[]>>('/api/v1/cvs');
};

export const callFetchCvById = (id: string) => {
  return axios.get<IBackendRes<ICv>>(`/api/v1/cvs/${id}`);
};

export const callCreateCv = (cv: Omit<ICv, '_id'>) => {
  return axios.post<IBackendRes<ICv>>('/api/v1/cvs', cv);
};

export const callUpdateCv = (id: string, cv: Partial<ICv>) => {
  return axios.patch<IBackendRes<ICv>>(`/api/v1/cvs/${id}`, cv);
};

export const callDeleteCv = (id: string) => {
  return axios.delete<IBackendRes<{ _id: string }>>(`/api/v1/cvs/${id}`);
};

/**
 * 
Module Salary insights (computed from job postings)
 */
export interface ISalaryStats {
  key: string;
  label?: string;
  count: number;
  min: number;
  p25: number;
  median: number;
  p75: number;
  max: number;
}

export interface ISalaryInsights {
  overall: ISalaryStats;
  byLevel: ISalaryStats[];
  byRole: ISalaryStats[];
  bySkill: ISalaryStats[];
  byLocation: ISalaryStats[];
  roles: { key: string; label: string }[];
  lastUpdated: string | null;
}

export const callFetchSalaryInsights = (query: string) => {
  return axios.get<IBackendRes<ISalaryInsights>>(`/api/v1/salaries/insights?${query}`);
};

/**
 * 
Module Company reviews & interviews (anonymous)
 */
export interface ICompanyReview {
  _id: string;
  rating: number;
  ratings?: Partial<
    Record<'salary' | 'culture' | 'management' | 'workLifeBalance' | 'growth', number>
  >;
  title: string;
  pros: string;
  cons: string;
  advice?: string;
  recommend?: boolean;
  jobTitle?: string;
  employmentStatus: 'current' | 'former';
  createdAt: string;
}

export interface ICompanyInterview {
  _id: string;
  jobTitle: string;
  difficulty: number;
  experience: 'positive' | 'neutral' | 'negative';
  outcome: 'offer' | 'no_offer' | 'pending';
  process: string;
  questions?: string;
  createdAt: string;
}

export interface IReviewSummary {
  reviews: {
    count: number;
    rating: number;
    recommendPercent: number;
    distribution: number[];
    categories: Record<string, number>;
  };
  interviews: { count: number; difficulty: number; positivePercent: number; offerPercent: number };
}

export const callFetchReviewSummary = (companyId: string) => {
  return axios.get<IBackendRes<IReviewSummary>>(`/api/v1/company-reviews/summary/${companyId}`);
};

export const callFetchCompanyReviews = (companyId: string, current = 1, pageSize = 5) => {
  return axios.get<IBackendRes<IModelPaginate<ICompanyReview>>>(
    `/api/v1/company-reviews/reviews?companyId=${companyId}&current=${current}&pageSize=${pageSize}`
  );
};

export const callFetchCompanyInterviews = (companyId: string, current = 1, pageSize = 5) => {
  return axios.get<IBackendRes<IModelPaginate<ICompanyInterview>>>(
    `/api/v1/company-reviews/interviews?companyId=${companyId}&current=${current}&pageSize=${pageSize}`
  );
};

export const callCreateCompanyReview = (
  review: Omit<ICompanyReview, '_id' | 'createdAt'> & { companyId: string }
) => {
  return axios.post<IBackendRes<{ _id: string }>>('/api/v1/company-reviews/reviews', review);
};

export const callCreateCompanyInterview = (
  interview: Omit<ICompanyInterview, '_id' | 'createdAt'> & { companyId: string }
) => {
  return axios.post<IBackendRes<{ _id: string }>>('/api/v1/company-reviews/interviews', interview);
};
