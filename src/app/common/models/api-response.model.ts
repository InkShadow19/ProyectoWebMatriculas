export class ApiResponse<T> {
    success: boolean;
    code: number;
    status: number;
    timezone: string;
    timestamp: string;
    message: string;
     data?: T;
}
