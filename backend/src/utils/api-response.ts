export const ok = (data: any) => ({ success: true, data });
export const created = (data: any) => ({ success: true, data });
export const fail = (message: string) => ({ success: false, message });
