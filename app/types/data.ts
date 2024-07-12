import { getSubscription } from "../lib/actions";

export interface JobResult { 
    status: string | null; 
    data: Record<string, any>; 
    error: string | null
}

export interface JobReceipt {
    jobId: string | undefined;
    status: 'completed' | 'failed' | 'active' | 'delayed' | 'prioritized' | 'waiting' | 'waiting-children' | "unknown";
    queue: number;
    when: number;
    delay: number
   }

   export interface PaymentDetails {
    email: string | null;
    name: string;
    receipt_url: string | null;
    chargeId: string;
}

export type UserPlan = 'Free' | 'Basic' | 'Pro' | 'Elite';

export type UserProfileInfo = {
    userPlan: UserPlan, 
    expiresAt: number, 
    credits: number
}


  